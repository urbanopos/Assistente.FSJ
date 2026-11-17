const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'}});
async function db(path:string,opt:RequestInit={}){const r=await fetch(base+'/rest/v1/'+path,{...opt,headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',...(opt.headers||{})}});if(!r.ok)throw Error('Banco: '+r.status);const t=await r.text();return t?JSON.parse(t):null}
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return reply({});
 if(req.method!=='POST')return reply({erro:'Método inválido'},405);
 if(req.headers.get('origin')!==origin)return reply({erro:'Origem inválida'},403);
 try{
  const bearer=req.headers.get('authorization')||'';
  if(!bearer.startsWith('Bearer ')||!key)return reply({erro:'Autenticação necessária'},401);
  const u=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:bearer}});
  if(!u.ok)return reply({erro:'Sessão inválida'},401);
  const user=await u.json();
  const owners=await db('fsj_titularidade?id=eq.true&auth_user_id=eq.'+encodeURIComponent(user.id)+'&select=pessoa_id');
  if(owners.length!==1)return reply({erro:'Acesso exclusivo do Proprietário'},403);
  const data=await req.json();const task=String(data.tarefa_id||''),person=String(data.pessoa_id||''),day=String(data.dia||'');
  if(data.action==='consultar-folgas'){
   const month=String(data.mes||'');
   if(!/^[a-zA-Z0-9_-]{5,80}$/.test(person)||!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month))return reply({erro:'Consulta inválida'},400);
   const people=await db('pessoas?id=eq.'+encodeURIComponent(person)+'&select=folgas_datas,folgas_motivos,ferias_inicio,ferias_fim');
   if(people.length!==1)return reply({erro:'Pessoa não encontrada'},404);
   const end=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).getUTCDate();
   const holidays=await db('feriados_fsj?dia=gte.'+month+'-01&dia=lte.'+month+'-'+end+'&select=dia,nome');
   const indisponiveis=await db('rpc/fsj_dias_dispensa_tarefa',{method:'POST',body:JSON.stringify({
    p_pessoa:person,p_inicio:month+'-01',p_fim:month+'-'+String(end).padStart(2,'0')
   })});
   return reply({ok:true,folgas_datas:people[0].folgas_datas||[],folgas_motivos:people[0].folgas_motivos||{},ferias_inicio:people[0].ferias_inicio,ferias_fim:people[0].ferias_fim,feriados:holidays,indisponiveis});
  }
  if(!/^[a-zA-Z0-9_-]{5,80}$/.test(task)||!/^[a-zA-Z0-9_-]{5,80}$/.test(person)||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(day)||!Number.isFinite(Date.parse(day+'T12:00:00Z'))||new Date(day+'T12:00:00Z').toISOString().slice(0,10)!==day)return reply({erro:'Dados inválidos'},400);
  const result=await db('rpc/fsj_concluir_calendario_periodico',{method:'POST',body:JSON.stringify({
   p_tarefa:task,p_pessoa:person,p_dia:day,p_proprietario:true
  })});
  return reply(result);
 }catch(e){return reply({erro:'Não foi possível registrar a conclusão: '+String(e).slice(0,120)},500)}
});