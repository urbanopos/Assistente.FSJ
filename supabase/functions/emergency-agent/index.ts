const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'}});}
async function db(path:string,body?:unknown){
 const r=await fetch(base+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error('Serviço de emergência indisponível.');return await r.json();
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});
 if(req.method!=='POST'||req.headers.get('origin')!==origin)return reply({erro:'Pedido inválido'},403);
 try{
  const authorization=req.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))return reply({erro:'Entre como proprietário'},401);
  const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return reply({erro:'Sessão expirada'},401);
  const user=await auth.json();
  const owners=await db('fsj_titularidade?id=eq.true&auth_user_id=eq.'+encodeURIComponent(user.id)+'&select=pessoa_id');
  if(owners.length!==1)return reply({erro:'Acesso exclusivo do proprietário'},403);
  const data=await req.json(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(new Date());
  const agent=(await db('fsj_emergency_agent?id=eq.true&select=*'))[0];
  const online=agent?.conectado===true&&Date.now()-Date.parse(agent.visto_em)<45000;
  if(data.action==='status')return reply({online});
  if(data.action==='job'){
   if(!/^[0-9a-f-]{36}$/i.test(String(data.id||'')))return reply({erro:'Pedido inválido'},400);
   const rows=await db('fsj_emergency_jobs?id=eq.'+encodeURIComponent(data.id)+'&select=id,estado,resultado,whatsapp_message_id,phone,mensagem,codigo');
   const job=rows[0];if(job&&job.estado!=='pronto_para_envio'){delete job.phone;delete job.mensagem;delete job.codigo;}return reply({job:job||null,online});
  }
  if(data.action!=='submit')return reply({erro:'Ação inválida'},400);
  const pid=String(data.pessoa_id||''),request=String(data.request_id||'');
  if(!pid||pid.length>100||!/^[0-9a-f-]{36}$/i.test(request))return reply({erro:'Destinatário ou pedido inválido'},400);
  const existing=await db('fsj_emergency_jobs?request_id=eq.'+encodeURIComponent(request)+'&select=id,estado');
  if(existing[0])return reply({job:existing[0]});
  const active=await db('fsj_emergency_jobs?pessoa_id=eq.'+encodeURIComponent(pid)+'&dia=eq.'+day+'&estado=in.(pendente,executando,pronto_para_envio,enviado,incerto)&select=id,estado');
  if(active[0])return reply({job:active[0]});
  if(!online)return reply({erro:'Executor de Emergência desconectado. Nenhuma mensagem apagada ou enviada.'},503);
  // Reutiliza autenticação, calendário, telefone oficial, código e mensagem do envio vigente.
  const prep=await fetch(base+'/functions/v1/envio-manual',{method:'POST',headers:{Origin:origin,Authorization:authorization,'Content-Type':'application/json'},body:JSON.stringify({action:'individual',pessoa_id:pid}),signal:AbortSignal.timeout(30000)});
  const d=await prep.json();
  if(!prep.ok)return reply({erro:d.erro||'Falha ao preparar mensagem'},prep.status);
  if(d.confirmado)return reply({erro:'Envio de hoje já confirmado. Nenhuma substituição criada.'},409);
  if(!/^55[0-9]{10,11}$/.test(d.phone)||!d.text||!d.codigo_mensagem)throw Error('Mensagem diária sem identificação válida.');
  // Concorrência também é protegida pelo índice parcial do banco.
  const rows=await db('fsj_emergency_jobs',{request_id:request,pessoa_id:pid,dia:day,phone:d.phone,mensagem:d.text,codigo:d.codigo_mensagem});
  return reply({job:{id:rows[0].id,estado:rows[0].estado}},202);
 }catch(e){return reply({erro:e instanceof Error?e.message:'Falha no executor'},400);}
});
