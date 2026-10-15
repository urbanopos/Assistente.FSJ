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
  const data=await req.json(),pid=String(data.pessoa_id||'');
  if(!pid||pid.length>100)return reply({erro:'Selecione o funcionário'},400);
  const now=new Date(),day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(now);
  if(Number(new Intl.DateTimeFormat('en-GB',{timeZone:'America/Recife',hour:'2-digit',hourCycle:'h23'}).format(now))<7)return reply({erro:'Envio disponível a partir das 7h'},409);
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
  const text='Bom dia, '+(person.identificacao||person.nome)+'.\nTarefas do dia '+day.split('-').reverse().join('/')+' — Fazenda São José.\n\nToque no link para abrir suas tarefas:\n'+link+(supervision?'\n\nSUPERVISÃO: DEMANDAS DOS SUPERVISIONADOS\n'+supervision:'');
  return reply({phone,text,ja_registrado:events.length>0,dia:day});
 }catch(e){return reply({erro:e instanceof Error?e.message:'Não foi possível preparar o envio.'},400);}
});
