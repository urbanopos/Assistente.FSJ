const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
function reply(data:unknown,status=200){return Response.json(data,{status,headers:{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'}})}
async function db(path:string,body?:unknown){const r=await fetch(base+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:path.startsWith('fsj_reserva_dispositivos')?'resolution=merge-duplicates,return=representation':'resolution=ignore-duplicates,return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Consulta indisponível');return r.json();}
async function hash(value:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});if(req.method!=='POST')return reply({erro:'Método inválido'},405);if(req.headers.get('origin')!==origin)return reply({erro:'Origem inválida'},403);
 const authorization=req.headers.get('authorization')||'';if(!authorization.startsWith('Bearer '))return reply({erro:'Entre como Proprietário no aplicativo principal.'},401);
 try{
 const data=await req.json();
 if(data.action==='device-status'){const credential=authorization.slice(7);if(!/^fsjr_[0-9a-f]{64}$/.test(credential))return reply({erro:'Dispositivo inválido'},403);const devices=await db('fsj_reserva_dispositivos?chave_hash=eq.'+await hash(credential)+'&ativo=eq.true&select=pessoa_id,expira_em');const device=devices[0];if(!device||new Date(device.expira_em)<=new Date())return reply({erro:'Vínculo expirado. Abra o aplicativo para renovar.'},403);const now=new Date(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(now),h=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Recife',hour:'2-digit',hourCycle:'h23'}).format(now));const permitted=await db('rpc/fsj_pode_enviar',{p_pessoa:device.pessoa_id,p_dia:day});const reads=await db('fsj_reserva_leituras?pessoa_id=eq.'+encodeURIComponent(device.pessoa_id)+'&dia=eq.'+day+'&select=dia');return reply({dia:day,liberado:h>=7&&permitted===true,lido:!!reads.length,apos_sete:h>=7});}
 const a=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization},signal:AbortSignal.timeout(10000)});if(!a.ok)return reply({erro:'Sessão expirada. Entre novamente no principal.'},401);
 const user=await a.json(),owners=await db('fsj_titularidade?select=auth_user_id,pessoa_id');const owner=owners.find((x:any)=>x.auth_user_id===user.id);if(!owner)return reply({erro:'Protótipo restrito ao Proprietário.'},403);
 // Identity comes only from the verified ownership record, never from the request body.
 if(data.action==='register-device'){if(!/^[0-9a-f-]{36}$/i.test(data.device_id||''))return reply({erro:'Dispositivo inválido'},400);const deviceKey='fsjr_'+[...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');await db('fsj_reserva_dispositivos?on_conflict=device_id',{device_id:data.device_id,pessoa_id:owner.pessoa_id,chave_hash:await hash(deviceKey),ativo:true,expira_em:new Date(Date.now()+90*86400000).toISOString()});return reply({device_key:deviceKey});}
 const pid=encodeURIComponent(owner.pessoa_id),now=new Date(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(now),hour=Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Recife',hour:'2-digit',hourCycle:'h23'}).format(now));
 if(data.action==='read'){if(data.dia!==day||hour<7)return reply({erro:'Quadro fora da data atual'},400);await db('fsj_reserva_leituras?on_conflict=pessoa_id,dia',{pessoa_id:owner.pessoa_id,dia:day});return reply({ok:true,dia:day});}
 if(hour<7)return reply({dia:day,liberado:false,motivo:'O quadro será liberado a partir das 7h.',agora:now.toISOString()});
 const permitted=await db('rpc/fsj_pode_enviar',{p_pessoa:owner.pessoa_id,p_dia:day});if(permitted!==true)return reply({dia:day,liberado:false,motivo:'Sem quadro diário: folga, férias, feriado ou cadastro sem envio autorizado.',agora:now.toISOString()});
 const path='quadros_do_dia?pessoa_id=eq.'+pid+'&dia=eq.'+day+'&select=token,expira_em';let boards=await db(path);
 if(!boards.length){await db('quadros_do_dia?on_conflict=pessoa_id,dia',{pessoa_id:owner.pessoa_id,dia:day,expira_em:new Date(new Date(day+'T03:00:00Z').getTime()+86400000).toISOString()});boards=await db(path);}
 if(!boards[0]||new Date(boards[0].expira_em)<=now)throw Error('Quadro indisponível');
 const reads=await db('fsj_reserva_leituras?pessoa_id=eq.'+pid+'&dia=eq.'+day+'&select=dia');return reply({dia:day,liberado:true,lido:!!reads.length,token:boards[0].token,agora:now.toISOString()});
 }catch{return reply({erro:'Não foi possível consultar o quadro. Confira a conexão e tente novamente.'},503);}
});
