const base=Deno.env.get('SUPABASE_URL');
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
function reply(body,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'}});}
async function db(path,body){const r=await fetch(base+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Não foi possível preparar o quadro.');const s=await r.text();return s?JSON.parse(s):null;}
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
  if(data.action==='status'){
   const [requests,heartbeat]=await Promise.all([db('fsj_envios_emergencia?order=solicitado_em.desc&limit=1&select=*'),db('fsj_executor_emergencia?select=visto_em&limit=1')]);
   return reply({pedido:requests[0]||null,executor_online:!!heartbeat[0]&&Date.now()-new Date(heartbeat[0].visto_em).getTime()<120000});
  }
  if(data.action!=='solicitar')return reply({erro:'Ação inválida'},400);
  const pedido=await db('rpc/fsj_solicitar_emergencia',{});
  return reply({pedido});
 }catch(e){return reply({erro:e instanceof Error?e.message:'Não foi possível preparar o envio.'},400);}
});
