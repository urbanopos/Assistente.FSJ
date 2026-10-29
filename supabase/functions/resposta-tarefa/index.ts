const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const allowed='https://urbanopos.github.io';
function reply(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'}})}
async function db(path:string,opt:RequestInit={}){const r=await fetch(base+'/rest/v1/'+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...(opt.headers||{})}});if(!r.ok)throw new Error('Banco: '+r.status+' '+(await r.text()).slice(0,300));let s=await r.text();return s?JSON.parse(s):null}
function taskSituation(t:any,answers:any[],day:string){
 if(t.situacao==='Arquivado')return 'Arquivado';
 if(t.exige_supervisao)return t.situacao||'Em aberto';
 const start=new Date(day+'T03:00:00Z').getTime(),end=start+86400000;
 const relevant=answers.filter(a=>a.tarefa_id===t.id&&(!t.diaria||((a.dia_previsto?a.dia_previsto===day:new Date(a.criado_em).getTime()>=start&&new Date(a.criado_em).getTime()<end))));
 if(relevant.some(a=>a.tipo==='sim')||(!t.diaria&&t.situacao==='Concluída'))return 'Concluída';
 const last=relevant[0];return last?.tipo==='nao'?'Pendente':last?.tipo==='pergunta'?'Aguardando gestão':t.diaria?(t.reaberta_dia===day?'Pendente':'Em aberto'):t.situacao||'Em aberto';
}
async function fsjOwnerAccessToken(token,lookup){
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token))return false;
 const owners=await lookup('fsj_titularidade?id=eq.true&select=pessoa_id');
 if(owners.length!==1)return false;
 let rows=await lookup('quadros_do_dia?token=eq.'+encodeURIComponent(token)+'&select=pessoa_id,expira_em');
 if(!rows.length)rows=await lookup('links_resposta?token=eq.'+encodeURIComponent(token)+'&select=pessoa_id,expira_em');
 const identity=rows[0];
 if(!identity||identity.pessoa_id!==owners[0].pessoa_id||Date.parse(identity.expira_em)<=Date.now())return false;
 const people=await lookup('pessoas?id=eq.'+encodeURIComponent(identity.pessoa_id)+'&ativo=eq.true&select=id');
 return people.length===1;
}
Deno.serve(async req=>{
 let ownerScheduleAccess=false;
 const respond=(body,status=200)=>reply(body&&typeof body==='object'&&!Array.isArray(body)?{...body,proprietario_horario_livre:ownerScheduleAccess}:body,status);

 if(req.method==='OPTIONS')return respond({});
 if(req.method!=='POST')return respond({erro:'Método inválido'},405);
 if(req.headers.get('origin')!==allowed)return respond({erro:'Origem inválida'},403);
 if(!key)return respond({erro:'Serviço indisponível'},503);
 try{
  const ct=req.headers.get('content-type')||'';
  let data:any,files:File[]=[];
  if(ct.includes('multipart/form-data')){const f=await req.formData();data={token:f.get('token'),action:f.get('action'),resposta:f.get('resposta'),justificativa:f.get('justificativa'),itens_faltantes:f.get('itens_faltantes')};files=f.getAll('arquivo').filter(x=>x instanceof File) as File[]}
  else data=await req.json();
  const token=String(data.token||'');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token))return respond({erro:'Link inválido'},400);
  const authHeader=req.headers.get('authorization')||'';
  let owner=false;
  if(authHeader.startsWith('Bearer ')){
    const authResponse=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:authHeader}});
    if(!authResponse.ok)return respond({erro:'Autenticacao invalida'},401);
    const authUser=await authResponse.json();
    const ownership=await db('fsj_titularidade?id=eq.true&auth_user_id=eq.'+encodeURIComponent(authUser.id)+'&select=pessoa_id');
    owner=ownership.length>0;
  }
  if(data.action==='diagnostic'){
    if(!owner)return respond({diagnostico:false});
    const boards=await db('quadros_do_dia?token=eq.'+token+'&select=pessoa_id,expira_em');
    const links=boards.length?[]:await db('links_resposta?token=eq.'+token+'&select=pessoa_id,expira_em');
    const target=boards[0]||links[0];
    if(!target||Date.parse(target.expira_em)<Date.now())return respond({erro:'Link expirado'},404);
    const people=await db('pessoas?id=eq.'+encodeURIComponent(target.pessoa_id)+'&select=ativo');
    if(!people[0]?.ativo)return respond({erro:'Pessoa indisponivel'},404);
    return respond({diagnostico:true});
  }
  ownerScheduleAccess=owner||await fsjOwnerAccessToken(token,path=>db(path));
  if(!ownerScheduleAccess&&await db('rpc/fsj_horario_resposta',{method:'POST',body:JSON.stringify({p_instante:new Date().toISOString()})})!==true)return respond({erro:'A partir das 7:00h, disponível para consulta, exceto nos horários de descanso e após o expediente.',codigo:'fora_expediente'},403);
  if(owner&&(data.action==='start'||data.action==='suspend'||data.action==='submit'))return respond({erro:'Modo Diagnostico: registro bloqueado'},403);
  if(data.action==='reminders'){
   const boards=await db('quadros_do_dia?token=eq.'+token+'&select=pessoa_id,dia,expira_em');
   const links=boards.length?[]:await db('links_resposta?token=eq.'+token+'&select=pessoa_id,dia,expira_em');
   const identity=boards[0]||links[0];
   if(!identity||new Date(identity.expira_em)<new Date())return respond({erro:'Link expirado ou inválido'},404);
   const person=encodeURIComponent(identity.pessoa_id);
   const [people,assignments,executions]=await Promise.all([
    db('pessoas?id=eq.'+person+'&select=ativo'),
    db('tarefa_responsaveis?pessoa_id=eq.'+person+'&select=tarefa_id'),
    db('execucoes_tarefa?pessoa_id=eq.'+person+'&select=tarefa_id,dia,estado,iniciado_em,retomado_em,concluido_em&order=iniciado_em.desc')
   ]);
   if(!people[0]?.ativo)return respond({erro:'Pessoa indisponível'},404);
   const ids=assignments.map((a:any)=>a.tarefa_id);
   const tasks=ids.length?await db('tarefas?id=in.('+ids.map(encodeURIComponent).join(',')+')&select=id,diaria,situacao'):[];
   const now=Date.now(),hour=3600000;
   const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Recife',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
   const start=new Date(today+'T07:00:00-03:00').getTime();
   const answers=ids.length?await db('retornos?cancelado_por_revisao=is.null&tarefa_id=in.('+ids.map(encodeURIComponent).join(',')+')&tipo=eq.sim&select=tarefa_id,criado_em,dia_previsto'):[];
   const done=(t:any,day:string)=>t.situacao==='Concluída'&&!t.diaria||answers.some((a:any)=>a.tarefa_id===t.id&&(!t.diaria||(a.dia_previsto||new Date(a.criado_em).toLocaleDateString('en-CA',{timeZone:'America/Recife'}))===day));
   const pending=tasks.filter((t:any)=>t.situacao!=='Arquivado'&&!done(t,today));
   const latest=Math.max(start,...executions.flatMap((e:any)=>[Date.parse(e.iniciado_em)||0,Date.parse(e.retomado_em)||0]));
   const stale=executions.filter((e:any)=>e.estado!=='concluida'&&!e.concluido_em&&tasks.some((t:any)=>t.id===e.tarefa_id&&t.situacao!=='Arquivado'&&!done(t,e.dia))&&now-Date.parse(e.iniciado_em)>=48*hour);
   const alerts=[];
   if(pending.length&&now-latest>=2*hour)alerts.push({kind:'start',anchor:latest,message:'NÃO ESQUEÇA REGISTRAR O INÍCIO DE TAREFA'});
   if(stale.length)alerts.push({kind:'finish',anchor:Math.min(...stale.map((e:any)=>Date.parse(e.iniciado_em)))+48*hour,message:'VERIFIQUE SE HÁ TAREFAS CONCLUÍDAS E NÃO INFORMADAS'});
   return respond({pessoa_id:identity.pessoa_id,alerts});
  }
  if(data.action==='board'){
   const boards=await db('quadros_do_dia?token=eq.'+token+'&select=*');
   const board=boards?.[0];
   if(!board||new Date(board.expira_em)<new Date())return respond({erro:'Quadro expirado ou inválido'},404);
   const [people,links,tasks,answers,assignments,executions]=await Promise.all([
    db('pessoas?id=eq.'+encodeURIComponent(board.pessoa_id)+'&select=identificacao,nome,ativo,tipo'),
    db('links_resposta?pessoa_id=eq.'+encodeURIComponent(board.pessoa_id)+'&dia=eq.'+board.dia+'&select=token,tarefa_id,respondido_em,ordem'),
    db('tarefas?select=id,descricao,criada_em,diaria,situacao,exige_supervisao,reaberta_dia,reaberta_em,reabertura_motivo,prioridade,codigo_tarefa,periodicidade,grupo_id'),
    db('retornos?cancelado_por_revisao=is.null&select=tarefa_id,tipo,criado_em,dia_previsto&order=criado_em.desc'),
    db('tarefa_responsaveis?pessoa_id=eq.'+encodeURIComponent(board.pessoa_id)+'&select=tarefa_id'),
    db('execucoes_tarefa?pessoa_id=eq.'+encodeURIComponent(board.pessoa_id)+'&dia=eq.'+board.dia+'&select=tarefa_id,estado')
   ]);
   if(!people?.length||!people[0].ativo)return respond({erro:'Quadro indisponível'},404);
   const [groups,groupMembers,allPeople]=await Promise.all([db('grupos?select=id,nome'),db('grupo_membros?select=grupo_id,pessoa_id'),db('pessoas?select=id,identificacao,nome')]);
   const groupInfo=(task:any)=>{const g=groups.find((x:any)=>x.id===task?.grupo_id);return {grupo_id:task?.grupo_id||null,grupo_nome:g?.nome||'',participantes:g?groupMembers.filter((m:any)=>m.grupo_id===g.id).map((m:any)=>{const p=allPeople.find((x:any)=>x.id===m.pessoa_id);return p?.identificacao||p?.nome||''}).filter(Boolean):[]};};
   const progress=await db('rpc/fsj_progresso_diario',{method:'POST',body:JSON.stringify({p_tarefas:assignments.map((a:any)=>a.tarefa_id),p_mes:board.dia.slice(0,7)+'-01',p_pessoa:board.pessoa_id})});
   if(data.situacao==='Arquivado'){
    const history=tasks.filter((t:any)=>t.situacao==='Arquivado'&&assignments.some((a:any)=>a.tarefa_id===t.id)).map((t:any)=>({tarefa_id:t.id,tarefa:t.descricao,codigo_tarefa:t.codigo_tarefa,periodicidade:t.periodicidade,prioridade:'normal',situacao:'Arquivado',somente_leitura:true,...groupInfo(t),progresso_mensal:progress[t.id]||null}));
    return respond({responsavel:people[0].identificacao||people[0].nome,visitante:String(people[0].tipo||'').toLowerCase()==='visitante',dia:board.dia,tarefas:history});
   }
   const done=(t:any)=>answers.some((a:any)=>a.tarefa_id===t.id&&a.tipo==='sim'&&(!t.diaria||(a.dia_previsto===board.dia)));
   const available=(t:any)=>!!t&&t.situacao!=='Arquivado'&&(t.diaria||t.situacao!=='Concluída')&&!done(t)&&assignments.some((a:any)=>a.tarefa_id===t.id);
   const missing=tasks.filter((t:any)=>available(t)&&!links.some((l:any)=>l.tarefa_id===t.id)&&new Date(t.criada_em).getTime()<=new Date(board.expira_em).getTime());
   for(const t of (owner?[]:missing)){const created=await db('links_resposta?select=token,tarefa_id,respondido_em,ordem',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({token:crypto.randomUUID(),tarefa_id:t.id,pessoa_id:board.pessoa_id,dia:board.dia,expira_em:board.expira_em,ordem:links.length+1})});links.push(created[0])}
   const items=links.map((l:any)=>({token:l.token,...groupInfo(tasks.find((t:any)=>t.id===l.tarefa_id)),tarefa_id:l.tarefa_id,progresso_mensal:progress[l.tarefa_id]||null,tarefa:tasks.find((t:any)=>t.id===l.tarefa_id)?.descricao||'',codigo_tarefa:tasks.find((t:any)=>t.id===l.tarefa_id)?.codigo_tarefa||'',periodicidade:tasks.find((t:any)=>t.id===l.tarefa_id)?.periodicidade||'pontual',prioridade:tasks.find((t:any)=>t.id===l.tarefa_id)?.prioridade||'normal',situacao:taskSituation(tasks.find((t:any)=>t.id===l.tarefa_id)||{},answers,board.dia),execucao:executions.find((e:any)=>e.tarefa_id===l.tarefa_id)||null,ordem:l.ordem||999,respondido:!!l.respondido_em,concluida:!available(tasks.find((t:any)=>t.id===l.tarefa_id))})).filter((x:any)=>x.tarefa&&!x.concluida).sort((a:any,b:any)=>a.ordem-b.ordem||a.tarefa.localeCompare(b.tarefa));
   return respond({responsavel:people[0].identificacao||people[0].nome,visitante:String(people[0].tipo||'').toLowerCase()==='visitante',dia:board.dia,criado_em:board.criado_em,tarefas:items});
  }
  const links=await db('links_resposta?token=eq.'+token+'&select=*');
  const link=links?.[0];
  if(!link||!(await db('rpc/fsj_link_resposta_vigente',{method:'POST',body:JSON.stringify({p_token:token})})))return respond({erro:'Link expirado ou inválido'},404);
  const [tasks,people,assign]=await Promise.all([db('tarefas?id=eq.'+encodeURIComponent(link.tarefa_id)+'&select=id,descricao,situacao,exige_supervisao,reaberta_dia,reaberta_em,reabertura_motivo,prioridade,diaria,codigo_tarefa,periodicidade'),db('pessoas?id=eq.'+encodeURIComponent(link.pessoa_id)+'&select=identificacao,nome,ativo,tipo'),db('tarefa_responsaveis?tarefa_id=eq.'+encodeURIComponent(link.tarefa_id)+'&pessoa_id=eq.'+encodeURIComponent(link.pessoa_id)+'&select=tarefa_id')]);
  if(!tasks?.length||!people?.length||!people[0].ativo||!assign?.length)return respond({erro:'Tarefa indisponível'},404);
  const progress=await db('rpc/fsj_progresso_diario',{method:'POST',body:JSON.stringify({p_tarefas:[link.tarefa_id],p_mes:link.dia.slice(0,7)+'-01',p_pessoa:link.pessoa_id})});
  const visitante=String(people[0].tipo||'').trim().toLowerCase()==='visitante';
  const detail={visitante,revisao:tasks[0].reaberta_em?{dia:tasks[0].reaberta_dia,em:tasks[0].reaberta_em,motivo:tasks[0].reabertura_motivo}:null,progresso_mensal:progress[link.tarefa_id]||null,tarefa:tasks[0].descricao,codigo_tarefa:tasks[0].codigo_tarefa,periodicidade:tasks[0].periodicidade||'pontual',prioridade:tasks[0].prioridade||'normal',responsavel:people[0].identificacao||people[0].nome,dia:link.dia,respondido:!!link.respondido_em||tasks[0].situacao==='Arquivado'};
  if(data.action==='detail'){const [executions,answers,gestorReplies]=await Promise.all([db('execucoes_tarefa?pessoa_id=eq.'+encodeURIComponent(link.pessoa_id)+'&tarefa_id=eq.'+encodeURIComponent(link.tarefa_id)+'&dia=eq.'+link.dia+'&select=estado,iniciado_em,retomado_em,suspenso_em,concluido_em'),db('retornos?cancelado_por_revisao=is.null&tarefa_id=eq.'+encodeURIComponent(link.tarefa_id)+'&select=tarefa_id,tipo,criado_em,dia_previsto&order=criado_em.desc'),db('respostas_perguntas_gestor?pessoa_id=eq.'+encodeURIComponent(link.pessoa_id)+'&tarefa_id=eq.'+encodeURIComponent(link.tarefa_id)+'&select=pergunta_id,resposta,respondida_em&order=respondida_em.desc')]);return respond({...detail,situacao:taskSituation(tasks[0],answers,link.dia),execucao:executions[0]||null, respostas_gestor:gestorReplies});}
  if(visitante)return respond({erro:'Perfil Visitante: acesso demonstrativo, sem registro de ações.'},403);
  if(tasks[0].situacao==='Arquivado')return respond({erro:'Tarefa arquivada: disponível somente para consulta.'},403);
  if(data.action==='start'){try{return respond(await db('rpc/fsj_iniciar_tarefa',{method:'POST',body:JSON.stringify({p_token:token})}));}catch(e){if(String(e).includes('FOLGA_SEMANAL_PENDENTE'))return respond({erro:'FOLGA SEMANAL NÃO REGISTRADA. Para iniciar esta tarefa, registre primeiro pelo menos um dia de folga desta semana.',codigo:'folga_semanal_pendente'},409);console.error('Falha ao iniciar tarefa',String(e));return respond({erro:'Não foi possível iniciar: confira se o link está vigente e a tarefa disponível.'},409);}}
  if(data.action==='suspend'){
   try{return respond(await db('rpc/fsj_suspender_tarefa',{method:'POST',body:JSON.stringify({p_token:token})}));}
   catch(e){console.error('Falha ao suspender tarefa',String(e));return respond({erro:'Não foi possível suspender: confira se a tarefa está em andamento e o link está vigente.'},409);}
  }
  if(data.action!=='submit')return respond({erro:'Ação inválida'},400);
  if(link.respondido_em)return respond({erro:'Esta tarefa já recebeu resposta.'},409);
  const resposta=String(data.resposta||'').toLowerCase(),justificativa=String(data.justificativa||'').trim(),itens=String(data.itens_faltantes||'').trim();
  if(itens.length>2000||(resposta!=='nao'&&itens))return respond({erro:'Itens Faltantes só pode ser informado na resposta NÃO, com até 2000 caracteres.'},400);
  if(!['sim','nao'].includes(resposta)||justificativa.length>2000||(resposta==='nao'&&!justificativa))return respond({erro:'Informe SIM ou NÃO e a justificativa quando escolher NÃO.'},400);
  if(files.length>3||files.some(f=>f.size>10485760||!['image/jpeg','image/png','image/webp','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/ogg','audio/webm'].includes(f.type)))return respond({erro:'Envie até 3 arquivos de foto, vídeo ou áudio, com até 10 MB cada.'},400);
  let saved:any;
  try{saved=await db('rpc/fsj_registrar_resposta',{method:'POST',body:JSON.stringify({p_token:token,p_resposta:resposta,p_justificativa:justificativa,p_itens_faltantes:itens})});}catch(e){if(String(e).includes('FOLGA_SEMANAL_PENDENTE'))return respond({erro:'FOLGA SEMANAL NÃO REGISTRADA. Registre pelo menos um dia de folga desta semana no quadro inicial antes de responder.',codigo:'folga_semanal_pendente'},409);if(String(e).includes('FSJ_FORA_EXPEDIENTE'))return respond({erro:'As tarefas só podem ser respondidas no horário de expediente: das 7h às 12h e das 14h às 16h20, no horário de Pernambuco. Envio bloqueado.',codigo:'fora_expediente'},403);if(String(e).includes('23505'))return respond({erro:'Esta tarefa já recebeu resposta.'},409);if(String(e).includes('22023'))return respond({erro:'Resposta inválida ou link indisponível.'},400);throw e;}
  const id=saved.id,errors:string[]=[];
  for(const file of files){
   const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-80);
   const path=link.dia+'/'+link.pessoa_id+'/'+id+'/'+crypto.randomUUID()+'-'+safe;
   const up=await fetch(base+'/storage/v1/object/respostas-tarefas/'+path,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':file.type,'x-upsert':'false'},body:file});
   if(!up.ok){errors.push(file.name);continue}
   await db('anexos',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({retorno_id:id,nome:file.name,tipo_mime:file.type,url:path})});
  }
  return respond({ok:true,tarefa_proprietario_id:saved.tarefa_proprietario_id,anexos_nao_salvos:errors});
 }catch(e){console.error('form error',String(e));return respond({erro:'Não foi possível registrar a resposta. Tente novamente.'},500)}
});

