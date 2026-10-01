const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const allowed='https://urbanopos.github.io';
function reply(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'}})}
async function db(path:string,opt:RequestInit={}){const r=await fetch(base+'/rest/v1/'+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...(opt.headers||{})}});if(!r.ok)throw new Error('Banco: '+r.status+' '+(await r.text()).slice(0,300));let s=await r.text();return s?JSON.parse(s):null}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});
 if(req.method!=='POST')return reply({erro:'Método inválido'},405);
 if(req.headers.get('origin')!==allowed)return reply({erro:'Origem inválida'},403);
 if(!key)return reply({erro:'Serviço indisponível'},503);
 try{
  const ct=req.headers.get('content-type')||'';
  let data:any,files:File[]=[];
  if(ct.includes('multipart/form-data')){const f=await req.formData();data={token:f.get('token'),action:f.get('action'),resposta:f.get('resposta'),justificativa:f.get('justificativa')};files=f.getAll('arquivo').filter(x=>x instanceof File) as File[]}
  else data=await req.json();
  const token=String(data.token||'');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token))return reply({erro:'Link inválido'},400);
  if(data.action==='board'){
   const boards=await db('quadros_do_dia?token=eq.'+token+'&select=*');
   const board=boards?.[0];
   if(!board||new Date(board.expira_em)<new Date())return reply({erro:'Quadro expirado ou inválido'},404);
   const [people,links,tasks,answers,assignments]=await Promise.all([
    db('pessoas?id=eq.'+encodeURIComponent(board.pessoa_id)+'&select=identificacao,nome,ativo'),
    db('links_resposta?pessoa_id=eq.'+encodeURIComponent(board.pessoa_id)+'&dia=eq.'+board.dia+'&select=token,tarefa_id,respondido_em,ordem'),
    db('tarefas?select=id,descricao,criada_em,diaria,situacao'),
    db('retornos?tipo=eq.sim&select=tarefa_id,tipo,criado_em&order=criado_em.desc'),
    db('tarefa_responsaveis?pessoa_id=eq.'+encodeURIComponent(board.pessoa_id)+'&select=tarefa_id')
   ]);
   if(!people?.length||!people[0].ativo)return reply({erro:'Quadro indisponível'},404);
   const done=(t:any)=>answers.some((a:any)=>a.tarefa_id===t.id&&a.tipo==='sim'&&(!t.diaria||(new Date(a.criado_em)>=new Date(board.dia+'T03:00:00Z')&&new Date(a.criado_em)<new Date(new Date(board.dia+'T03:00:00Z').getTime()+86400000))));
   const available=(t:any)=>!!t&&(t.diaria||t.situacao!=='Concluída')&&!done(t)&&assignments.some((a:any)=>a.tarefa_id===t.id);
   const missing=tasks.filter((t:any)=>available(t)&&!links.some((l:any)=>l.tarefa_id===t.id)&&new Date(t.criada_em).getTime()<=new Date(board.expira_em).getTime());
   for(const t of missing){const created=await db('links_resposta?select=token,tarefa_id,respondido_em,ordem',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({token:crypto.randomUUID(),tarefa_id:t.id,pessoa_id:board.pessoa_id,dia:board.dia,expira_em:board.expira_em,ordem:links.length+1})});links.push(created[0])}
   const items=links.map((l:any)=>({token:l.token,tarefa_id:l.tarefa_id,tarefa:tasks.find((t:any)=>t.id===l.tarefa_id)?.descricao||'',ordem:l.ordem||999,respondido:!!l.respondido_em,concluida:!available(tasks.find((t:any)=>t.id===l.tarefa_id))})).filter((x:any)=>x.tarefa&&!x.concluida).sort((a:any,b:any)=>a.ordem-b.ordem||a.tarefa.localeCompare(b.tarefa));
   return reply({responsavel:people[0].identificacao||people[0].nome,dia:board.dia,criado_em:board.criado_em,tarefas:items});
  }
  const links=await db('links_resposta?token=eq.'+token+'&select=*');
  const link=links?.[0];
  if(!link||new Date(link.expira_em)<new Date())return reply({erro:'Link expirado ou inválido'},404);
  const [tasks,people,assign]=await Promise.all([db('tarefas?id=eq.'+encodeURIComponent(link.tarefa_id)+'&select=id,descricao,situacao'),db('pessoas?id=eq.'+encodeURIComponent(link.pessoa_id)+'&select=identificacao,nome,ativo'),db('tarefa_responsaveis?tarefa_id=eq.'+encodeURIComponent(link.tarefa_id)+'&pessoa_id=eq.'+encodeURIComponent(link.pessoa_id)+'&select=tarefa_id')]);
  if(!tasks?.length||!people?.length||!people[0].ativo||!assign?.length)return reply({erro:'Tarefa indisponível'},404);
  const detail={tarefa:tasks[0].descricao,responsavel:people[0].identificacao||people[0].nome,dia:link.dia,respondido:!!link.respondido_em};
  if(data.action==='detail')return reply(detail);
  if(data.action!=='submit')return reply({erro:'Ação inválida'},400);
  if(link.respondido_em)return reply({erro:'Esta tarefa já recebeu resposta.'},409);
  const resposta=String(data.resposta||'').toLowerCase(),justificativa=String(data.justificativa||'').trim();
  if(!['sim','nao'].includes(resposta)||justificativa.length>2000||(resposta==='nao'&&!justificativa))return reply({erro:'Informe SIM ou NÃO e a justificativa quando escolher NÃO.'},400);
  if(files.length>3||files.some(f=>f.size>10485760||!['image/jpeg','image/png','image/webp','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/ogg','audio/webm'].includes(f.type)))return reply({erro:'Envie até 3 arquivos de foto, vídeo ou áudio, com até 10 MB cada.'},400);
  const existing=await db('retornos?tarefa_id=eq.'+encodeURIComponent(link.tarefa_id)+'&pessoa_id=eq.'+encodeURIComponent(link.pessoa_id)+'&criado_em=gte.'+encodeURIComponent(link.dia+'T03:00:00Z')+'&criado_em=lt.'+encodeURIComponent(new Date(new Date(link.dia+'T03:00:00Z').getTime()+86400000).toISOString())+'&select=id&limit=1');
  if(existing?.length)return reply({erro:'Esta tarefa já recebeu resposta.'},409);
  const row=await db('retornos?select=id',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({tarefa_id:link.tarefa_id,pessoa_id:link.pessoa_id,origem:'formulario',tipo:resposta,conteudo:justificativa})});
  const id=row[0].id,errors:string[]=[];
  for(const file of files){
   const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-80);
   const path=link.dia+'/'+link.pessoa_id+'/'+id+'/'+crypto.randomUUID()+'-'+safe;
   const up=await fetch(base+'/storage/v1/object/respostas-tarefas/'+path,{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':file.type,'x-upsert':'false'},body:file});
   if(!up.ok){errors.push(file.name);continue}
   await db('anexos',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({retorno_id:id,nome:file.name,tipo_mime:file.type,url:path})});
  }
  await db('links_resposta?token=eq.'+token,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({respondido_em:new Date().toISOString()})});
  return reply({ok:true,anexos_nao_salvos:errors});
 }catch(e){console.error('form error',String(e));return reply({erro:'Não foi possível registrar a resposta. Tente novamente.'},500)}
});
