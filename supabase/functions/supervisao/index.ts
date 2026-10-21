const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
function reply(body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'}})}
async function db(path:string,body?:unknown){const r=await fetch(base+'/rest/v1/'+path,{method:body===undefined?'GET':'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});if(!r.ok){const e=await r.json().catch(()=>({}));throw Error(e.message||'Falha na Armazenagem');}const text=await r.text();return text?JSON.parse(text):null;}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});
 if(req.method!=='POST')return reply({erro:'Metodo invalido'},405);
 if(req.headers.get('origin')!==origin)return reply({erro:'Origem invalida'},403);
 if(!key)return reply({erro:'Servico indisponivel'},503);
 try{
  const data=await req.json();
  if(['available','demands','archive'].includes(data.action)){
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(data.token||'')))return reply({erro:'Link invalido'},400);
   if(data.action==='archive'){
    if(typeof data.tarefa_id!=='string'||data.tarefa_id.length>200)return reply({erro:'Tarefa inválida'},400);
    try{return reply(await db('rpc/fsj_aprovar_arquivamento',{p_tarefa:data.tarefa_id,p_token:data.token}));}
    catch(e){return reply({erro:(e as Error).message},403);}
   }
   if(data.action==='demands'){
    try{
     const result=await db('rpc/fsj_supervisor_demandas',{p_token:data.token});
     // Only enrich tasks already authorized by the token-scoped RPC.
     const tasks=result.tarefas||[];
     if(tasks.length){
      const ids=tasks.map((t:any)=>JSON.stringify(t.id)).join(',');
      const priorities=await db('tarefas?id=in.'+encodeURIComponent('('+ids+')')+'&select=id,prioridade,codigo_tarefa,periodicidade');
      const progress=await db('rpc/fsj_progresso_diario',{p_tarefas:tasks.map((t:any)=>t.id),p_escopo:(result.pessoas||[]).map((p:any)=>p.id)});
      // Per-person denominators are returned only for this supervisor's authorized people.
      const byPerson:any={};
      for(const p of result.pessoas||[])byPerson[p.id]=await db('rpc/fsj_progresso_diario',{p_tarefas:tasks.map((t:any)=>t.id),p_pessoa:p.id,p_escopo:(result.pessoas||[]).map((p:any)=>p.id)});
      for(const t of tasks){
       const stored=priorities.find((p:any)=>p.id===t.id);
       t.prioridade=stored?.prioridade||'normal';t.codigo_tarefa=stored?.codigo_tarefa||null;t.periodicidade=stored?.periodicidade||'pontual';
       t.progresso_mensal=progress[t.id]||null;
       t.progresso_por_pessoa=Object.fromEntries(Object.entries(byPerson).filter(([,v]:any)=>v[t.id]).map(([id,v]:any)=>[id,v[t.id]]));
      }
     }
     return reply(result);
    }
    catch{return reply({erro:'Acesso de supervisao indisponivel ou link expirado. Solicite ao gestor a verificacao do cadastro.'},403);}
   }
   // A board token only reveals whether its own holder has an active supervisor role.
   const boards=await db('quadros_do_dia?token=eq.'+data.token+'&select=pessoa_id');
   if(!boards?.length)return reply({ativo:false});
   const link=await db('rpc/fsj_link_supervisao',{p_pessoa:boards[0].pessoa_id,p_token:data.token});return reply({ativo:!!link,link});
  }
  const authorization=req.headers.get('authorization')||'';
  if(!authorization.startsWith('Bearer '))return reply({erro:'Entre como gestor'},401);
  const auth=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:authorization},signal:AbortSignal.timeout(10000)});
  if(!auth.ok)return reply({erro:'Sessao expirada; entre novamente'},401);
  const user=await auth.json();if(String(user.email||'').toLowerCase()!=='urbanopos@yahoo.com.br')return reply({erro:'Acesso exclusivo do gestor'},403);
  if(['completion-info','reopen-completion'].includes(data.action)){
   if(typeof data.tarefa_id!=='string'||!data.tarefa_id||data.tarefa_id.length>200)return reply({erro:'Demanda inválida'},400);
   try{
    if(data.action==='completion-info')return reply(await db('rpc/fsj_info_conclusao',{p_tarefa:data.tarefa_id,p_auth:user.id}));
    if(typeof data.motivo!=='string'||!data.motivo.trim()||data.motivo.length>1000)return reply({erro:'Informe o motivo, com até 1000 caracteres'},400);
    const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if(!uuid.test(String(data.requisicao||''))||(data.conclusao_id!=null&&!uuid.test(String(data.conclusao_id))))return reply({erro:'Identificador inválido. Atualize a demanda'},400);
    return reply(await db('rpc/fsj_cancelar_conclusao',{p_tarefa:data.tarefa_id,p_auth:user.id,p_motivo:data.motivo,p_requisicao:data.requisicao,p_conclusao:data.conclusao_id||null}));
   }catch(e){return reply({erro:(e as Error).message},409);}
  }
  if(data.action==='daily-progress'){
   if(data.mes!=null&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(data.mes)))return reply({erro:'Mês inválido'},400);
   if(data.pessoa_id!=null&&(typeof data.pessoa_id!=='string'||data.pessoa_id.length>200))return reply({erro:'Pessoa inválida'},400);
   // Token-validated owner identity plus central ownership binding.
   const owners=await db('fsj_titularidade?id=eq.true&auth_user_id=eq.'+encodeURIComponent(user.id)+'&select=pessoa_id');
   if(!owners.length)return reply({erro:'Acesso exclusivo do Proprietário'},403);
   const tasks=await db('tarefas?periodicidade=eq.diaria&select=id');
   const resumos=await db('rpc/fsj_progresso_diario',{p_tarefas:tasks.map((t:any)=>t.id),p_mes:data.mes?data.mes+'-01':null,p_pessoa:data.pessoa_id||null});
   return reply({resumos});
  }
  if(data.action==='archive-owner'){
   if(typeof data.tarefa_id!=='string'||data.tarefa_id.length>200)return reply({erro:'Tarefa inválida'},400);
   try{return reply(await db('rpc/fsj_aprovar_arquivamento',{p_tarefa:data.tarefa_id,p_auth:user.id}));}
   catch(e){return reply({erro:(e as Error).message},403);}
  }
  if(data.action==='manager-list'){
   const [supervisores,pessoas,grupos]=await Promise.all([db('supervisores_fsj?select=*'),db('supervisores_pessoas?select=*'),db('supervisores_grupos?select=*')]);
   return reply({supervisores:supervisores.map((s:any)=>({...s,pessoas:pessoas.filter((p:any)=>p.supervisor_id===s.pessoa_id).map((p:any)=>p.pessoa_id),grupos:grupos.filter((g:any)=>g.supervisor_id===s.pessoa_id).map((g:any)=>g.grupo_id)}))});
  }
  if(data.action==='manager-set'){
   if(typeof data.ativo!=='boolean'||!Array.isArray(data.pessoas)||!Array.isArray(data.grupos)||data.pessoas.length>100||data.grupos.length>100||[...data.pessoas,...data.grupos].some(v=>typeof v!=='string'||v.length>100))return reply({erro:'Configuracao invalida'},400);
   await db('rpc/fsj_definir_supervisor',{p_pessoa:String(data.pessoa_id||''),p_ativo:data.ativo,p_pessoas:data.pessoas,p_grupos:data.grupos});return reply({ok:true});
  }
  return reply({erro:'Acao invalida'},400);
 }catch(e){console.error('supervisao',String(e));return reply({erro:'Nao foi possivel atualizar a supervisao. Confira os integrantes e grupos selecionados.'},400);}
});

