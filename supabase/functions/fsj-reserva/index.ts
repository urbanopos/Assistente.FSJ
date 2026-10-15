const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
function reply(data:unknown,status=200){return Response.json(data,{status,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'}})}
async function db(path:string,body?:unknown){const r=await fetch(base+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Consulta indisponível');return r.json();}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});if(req.method!=='POST')return reply({erro:'Método inválido'},405);if(req.headers.get('origin')!==origin)return reply({erro:'Origem inválida'},403);
 const authorization=req.headers.get('authorization')||'';if(!authorization.startsWith('Bearer '))return reply({erro:'Entre como Proprietário no aplicativo principal.'},401);
 try{
 const a=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization},signal:AbortSignal.timeout(10000)});if(!a.ok)return reply({erro:'Sessão expirada. Entre novamente no principal.'},401);
 const user=await a.json(),owners=await db('fsj_titularidade?select=auth_user_id,pessoa_id');const owner=owners.find((x:any)=>x.auth_user_id===user.id);if(!owner)return reply({erro:'Protótipo restrito ao Proprietário.'},403);
 // Identity comes only from the verified ownership record, never from the request body.
 const pid=encodeURIComponent(owner.pessoa_id),now=new Date(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(now),hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Recife',hour:'2-digit',hourCycle:'h23'}).format(now));
 if(hour<7)return reply({dia:day,liberado:false,motivo:'O quadro será liberado a partir das 7h.',agora:now.toISOString()});
 const permitted=await db('rpc/fsj_pode_enviar',{p_pessoa:owner.pessoa_id,p_dia:day});if(permitted!==true)return reply({dia:day,liberado:false,motivo:'Sem quadro diário: folga, férias, feriado ou cadastro sem envio autorizado.',agora:now.toISOString()});
 const path='quadros_do_dia?pessoa_id=eq.'+pid+'&dia=eq.'+day+'&select=token,expira_em';let boards=await db(path);
 if(!boards.length){await db('quadros_do_dia?on_conflict=pessoa_id,dia',{pessoa_id:owner.pessoa_id,dia:day,expira_em:new Date(new Date(day+'T03:00:00Z').getTime()+86400000).toISOString()});boards=await db(path);}
 if(!boards[0]||new Date(boards[0].expira_em)<=now)throw Error('Quadro indisponível');
 return reply({dia:day,liberado:true,token:boards[0].token,agora:now.toISOString()});
 }catch{return reply({erro:'Não foi possível consultar o quadro. Confira a conexão e tente novamente.'},503);}
});
