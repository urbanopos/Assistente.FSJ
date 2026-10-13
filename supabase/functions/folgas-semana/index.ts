const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(new Date());
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'}})}
async function db(path:string,body?:unknown){const r=await fetch(base+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});if(!r.ok){const e=await r.json().catch(()=>({}));throw Error(e.message||'Falha na Armazenagem');}const text=await r.text();return text?JSON.parse(text):null;}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});
 if(req.method!=='POST')return reply({erro:'Metodo invalido'},405);
 if(req.headers.get('origin')!==origin)return reply({erro:'Origem invalida'},403);
 if(!key)return reply({erro:'Servico indisponivel'},503);
 try{
  const data=await req.json();
  if(['calendar','choose'].includes(data.action)){
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(data.token||'')))return reply({erro:'Link invalido'},400);
   if(data.action==='choose'&&!/^\d{4}-\d{2}-\d{2}$/.test(String(data.dia||'')))return reply({erro:'Escolha o dia da folga'},400);
   const agenda=await db('rpc/fsj_escolher_folga',{p_token:data.token,p_dia:data.action==='choose'?data.dia:null});
   return reply({agenda});
  }
  // Manager authority is checked against Supabase Auth on every write, never supplied by the client.
  const authorization=req.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))return reply({erro:'Entre como gestor'},401);
  const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return reply({erro:'Sessao expirada; entre novamente'},401);
  const user=await auth.json();
  if(String(user.email||'').toLowerCase()!=='urbanopos@yahoo.com.br')return reply({erro:'Acesso exclusivo do gestor'},403);
  if(data.action==='manager-calendar'){
   await db('rpc/fsj_preparar_calendario',{p_dia:today()});
   const day=String(data.semana||today());if(!/^\d{4}-\d{2}-\d{2}$/.test(day))return reply({erro:'Semana invalida'},400);
   const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));const semana=date.toISOString().slice(0,10);
   const start=new Date(today()+'T12:00:00Z'),end=new Date(start);start.setUTCDate(start.getUTCDate()-30);end.setUTCDate(end.getUTCDate()+30);
   const from=start.toISOString().slice(0,10),to=end.toISOString().slice(0,10);
   const [folgas,feriados,decisoes,historico]=await Promise.all([
    db('folgas_semana?semana=eq.'+semana+'&select=*'),db('feriados_fsj?dia=gte.'+from+'&dia=lte.'+to+'&order=dia'),
    db('feriados_envio?dia=gte.'+from+'&dia=lte.'+to+'&select=*'),db('folgas_historico?semana=eq.'+semana+'&order=criado_em.desc&limit=100')]);
   return reply({semana,folgas,feriados,decisoes,historico});
  }
  if(data.action==='manager-set'){
   if(!/^\d{4}-\d{2}-\d{2}$/.test(String(data.semana||''))||!/^\d{4}-\d{2}-\d{2}$/.test(String(data.dia||'')))return reply({erro:'Data invalida'},400);
   return reply({agenda:await db('rpc/fsj_gestor_folga',{p_pessoa:String(data.pessoa_id||''),p_semana:data.semana,p_dia:data.dia})});
  }
  if(data.action==='holiday-set'){
   if(typeof data.receber!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(String(data.dia||'')))return reply({erro:'Informe a decisao para o feriado'},400);
   const holidays=await db('feriados_fsj?dia=eq.'+data.dia+'&select=dia');if(!holidays.length)return reply({erro:'Feriado nao cadastrado'},400);
   await db('feriados_envio?on_conflict=pessoa_id,dia',{pessoa_id:String(data.pessoa_id||''),dia:data.dia,receber:data.receber,atualizado_em:new Date().toISOString()});
   return reply({ok:true});
  }
  return reply({erro:'Acao invalida'},400);
 }catch(e){const message=e instanceof Error?e.message:'Falha na operacao';console.error('folgas',message);return reply({erro:message},400);}
});
