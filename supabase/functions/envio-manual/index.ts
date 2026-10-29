const base=Deno.env.get('SUPABASE_URL');
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
function reply(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'}});}
async function db(path,body,method=body===undefined?'GET':'POST'){const r=await fetch(base+'/rest/v1/'+path,{method,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Não foi possível preparar o quadro.');const s=await r.text();return s?JSON.parse(s):null;}
function fsjCodigoMensagem(board,day){
 const created=new Date(board.criado_em||day+'T03:00:00Z');
 const stamp=Number.isFinite(created.getTime())?created.toISOString().replace(/[-:.]/g,''):day.replace(/-/g,'')+'T030000000Z';
 return 'FSJ-'+stamp+'-'+board.token;
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});
 if(req.method!=='POST')return reply({erro:'Método inválido'},405);
 if(req.headers.get('origin')!==origin)return reply({erro:'Origem inválida'},403);
 if(!key)return reply({erro:'Serviço indisponível'},503);
 try{
  const authorization=req.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))return reply({erro:'Entre como gestor'},401);
  const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return reply({erro:'Sessão expirada; entre novamente'},401);
  const user=await auth.json();
  if(String(user.email||'').toLowerCase()!=='urbanopos@yahoo.com.br')return reply({erro:'Acesso exclusivo do proprietário'},403);
  const data=await req.json();
  const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(new Date());
  if(data.action==='abrir-tarefa'){
   const pid=String(data.pessoa_id||''),tid=String(data.tarefa_id||''),day=today();
   if(!pid||pid.length>100||!tid||tid.length>100)return reply({erro:'Selecione a tarefa e seu responsável.'},400);
   const [people,assignments,tasks]=await Promise.all([
    db('pessoas?id=eq.'+encodeURIComponent(pid)+'&ativo=eq.true&select=id'),
    db('tarefa_responsaveis?pessoa_id=eq.'+encodeURIComponent(pid)+'&tarefa_id=eq.'+encodeURIComponent(tid)+'&select=tarefa_id'),
    db('tarefas?id=eq.'+encodeURIComponent(tid)+'&select=id,situacao,diaria')
   ]);
   if(!people.length||!assignments.length||!tasks.length)return reply({erro:'Tarefa ou responsável indisponível.'},404);
   const path='links_resposta?pessoa_id=eq.'+encodeURIComponent(pid)+'&tarefa_id=eq.'+encodeURIComponent(tid)+'&dia=eq.'+day+'&select=token,expira_em,respondido_em&order=expira_em.desc&limit=1';
   let links=await db(path);
   if(!links.length){await db('links_resposta',{token:crypto.randomUUID(),pessoa_id:pid,tarefa_id:tid,dia:day,expira_em:new Date(new Date(day+'T03:00:00Z').getTime()+86400000).toISOString()});links=await db(path);}
   if(!links[0]||new Date(links[0].expira_em)<=new Date())return reply({erro:'Link do dia expirado.'},409);
   return reply({token:links[0].token,concluida:tasks[0].situacao==='Concluída'&&!tasks[0].diaria});
  }
  if(data.action==='individuais-status'){
   const rows=await db('fsj_envios_manuais?dia=eq.'+today()+'&select=pessoa_id,dia,confirmado_em,whatsapp_message_id,resultado_reconciliacao');
   return reply({dia:today(),envios:rows});
  }
  if(data.action==='confirmar'){
   const pid=String(data.pessoa_id||''),day=today();
   if(data.dia!==day||!pid||pid.length>100)return reply({erro:'Confirme somente o envio de hoje.'},400);
   const people=await db('pessoas?id=eq.'+encodeURIComponent(pid)+'&ativo=eq.true&select=whatsapp');
   const boards=await db('quadros_do_dia?pessoa_id=eq.'+encodeURIComponent(pid)+'&dia=eq.'+day+'&select=token,criado_em');
   if(!people[0]||!boards[0])return reply({erro:'Prepare o quadro de hoje antes de confirmar.'},409);
   let phone=String(people[0].whatsapp||'').replace(/\D/g,'');if(phone.length===10||phone.length===11)phone='55'+phone;
   if(!/^55\d{10,11}$/.test(phone))return reply({erro:'WhatsApp inválido no cadastro.'},400);
   await db('fsj_envios_manuais?on_conflict=pessoa_id,dia',{pessoa_id:pid,dia:day,token:boards[0].token,whatsapp:phone});
   // Preserve the original declaration timestamp on repeated confirmations.
   await db('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(pid)+'&dia=eq.'+day+'&confirmado_em=is.null',{confirmado_em:new Date().toISOString()},'PATCH');
   const rows=await db('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(pid)+'&dia=eq.'+day+'&select=id,pessoa_id,dia,confirmado_em,whatsapp_message_id,resultado_reconciliacao');
   const row=rows[0];
   await db('mensagens_whatsapp?on_conflict=id',{id:row.id,pessoa_id:pid,direcao:'saida',tipo:'quadro_manual_confirmado',conteudo:JSON.stringify({dia:day,status:'confirmado_pelo_gestor',confirmacao_tecnica:false,codigo_mensagem:fsjCodigoMensagem(boards[0],day)}),criado_em:row.confirmado_em});
   return reply({envio:row});
  }
  if(data.action==='individual'){
  const pid=String(data.pessoa_id||'');
  if(!pid||pid.length>100)return reply({erro:'Selecione o funcionário'},400);
  const now=new Date(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(now);
  await db('rpc/fsj_preparar_calendario',{p_dia:day});
  if(await db('rpc/fsj_pode_enviar',{p_pessoa:pid,p_dia:day})!==true)return reply({erro:'Envio bloqueado: confira cadastro ativo, recebimento às 7h, folgas, férias e feriados.'},409);
  const people=await db('pessoas?id=eq.'+encodeURIComponent(pid)+'&select=nome,identificacao,whatsapp');
  const person=people[0];if(!person)return reply({erro:'Cadastro não encontrado'},404);
  let phone=String(person.whatsapp||'').replace(/\D/g,'');if(phone.length===10||phone.length===11)phone='55'+phone;
  if(!/^55\d{10,11}$/.test(phone))return reply({erro:'WhatsApp inválido no cadastro'},400);
  const path='quadros_do_dia?pessoa_id=eq.'+encodeURIComponent(pid)+'&dia=eq.'+day+'&select=*';
  let boards=await db(path);
  if(!boards.length){await db('quadros_do_dia?on_conflict=pessoa_id,dia',{pessoa_id:pid,dia:day,expira_em:new Date(new Date(day+'T03:00:00Z').getTime()+86400000).toISOString()});boards=await db(path);}
  if(!boards[0]||new Date(boards[0].expira_em)<=now)throw Error('Quadro do dia indisponível ou expirado.');
  const link='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token='+boards[0].token;
  const events=await db('mensagens_whatsapp?pessoa_id=eq.'+encodeURIComponent(pid)+'&tipo=eq.quadro_automatico&criado_em=gte.'+encodeURIComponent(day+'T03:00:00Z')+'&whatsapp_message_id=not.is.null&select=id&limit=1');
  const supervision=await db('rpc/fsj_link_supervisao',{p_pessoa:pid,p_token:boards[0].token});
  const text='*FAZENDA SÃO JOSÉ – Tarefas do Dia '+day.split('-').reverse().join('/')+'*\n\n'+(person.identificacao||person.nome)+'\n\nCONSULTA TAREFAS\n'+link+(supervision?'\n\nTAREFAS DE TERCEIROS\n'+supervision:'')+'\n\nConsulta disponível a partir das 7h, horário de Pernambuco.\n\nCódigo da mensagem: '+fsjCodigoMensagem(boards[0],day)+'\n\n*ESTA MENSAGEM CANCELA AS ANTERIORES*';
  await db('fsj_envios_manuais?on_conflict=pessoa_id,dia',{pessoa_id:pid,dia:day,token:boards[0].token,whatsapp:phone});
  const manual=await db('fsj_envios_manuais?pessoa_id=eq.'+encodeURIComponent(pid)+'&dia=eq.'+day+'&select=confirmado_em');
  return reply({phone,text,codigo_mensagem:fsjCodigoMensagem(boards[0],day),ja_registrado:events.length>0,dia:day,confirmado:!!manual[0]?.confirmado_em,confirmado_em:manual[0]?.confirmado_em||null});
  }
  if(data.action==='status'){
   const [requests,heartbeat]=await Promise.all([db('fsj_envios_emergencia?order=solicitado_em.desc&limit=1&select=*'),db('fsj_executor_emergencia?select=visto_em&limit=1')]);
   return reply({pedido:requests[0]||null,executor_online:!!heartbeat[0]&&Date.now()-new Date(heartbeat[0].visto_em).getTime()<120000});
  }
  if(data.action!=='solicitar')return reply({erro:'Ação inválida'},400);
  const pedido=await db('rpc/fsj_solicitar_emergencia',{});
  return reply({pedido});
 }catch(e){return reply({erro:e instanceof Error?e.message:'Não foi possível preparar o envio.'},400);}
});
