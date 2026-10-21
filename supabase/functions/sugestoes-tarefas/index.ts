const base=Deno.env.get('SUPABASE_URL')!;
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}').default;
const origin='https://urbanopos.github.io';
const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type,authorization,apikey,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
async function db(path:string,body?:unknown){const r=await fetch(base+'/rest/v1/'+path,{method:body?'POST':'GET',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Não foi possível concluir a operação. Confira o acesso e tente novamente.');return r.json();}
const uuid=(s:unknown)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return reply({});
 if(req.method!=='POST'||req.headers.get('origin')!==origin)return reply({erro:'Pedido não permitido'},403);
 try{
  const raw=await req.text();if(raw.length>12000)return reply({erro:'Pedido muito grande'},413);const d=JSON.parse(raw);
  if(['gestor_listar','decidir'].includes(d.action)){
   const auth=req.headers.get('authorization')||'';
   const r=await fetch(base+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(10000)});
   if(!r.ok)return reply({erro:'Entre como gestor'},401);const user=await r.json();
   const owners=await db('fsj_titularidade?auth_user_id=eq.'+encodeURIComponent(user.id)+'&select=pessoa_id');if(!owners.length)return reply({erro:'Acesso exclusivo do gestor'},403);
   if(d.action==='gestor_listar')return reply({sugestoes:await db('sugestoes_tarefas?select=id,numero,pessoa_id,descricao,estado,observacoes,criado_em,decidido_em,tarefa_gestor_id,tipo&order=criado_em.desc&limit=200')});
   if(!uuid(d.id)||!['aprovada','rejeitada'].includes(d.estado)||typeof d.observacoes!=='string'||!d.observacoes.trim()||d.observacoes.length>2000)return reply({erro:'Informe a decisão e a justificativa'},400);
   return reply({sugestao:await db('rpc/fsj_decidir_sugestao',{p_id:d.id,p_estado:d.estado,p_observacoes:d.observacoes,p_gestor:user.id})});
  }
  if(!uuid(d.token))return reply({erro:'Link inválido'},400);
  const rows=await db('links_resposta?token=eq.'+d.token+'&select=pessoa_id,tarefa_id,expira_em');const link=rows[0];
  if(!link||Date.parse(link.expira_em)<=Date.now())return reply({erro:'Link expirado. Abra o quadro atual para consultar suas sugestões.'},403);
  const [people,assigned]=await Promise.all([db('pessoas?id=eq.'+encodeURIComponent(link.pessoa_id)+'&ativo=eq.true&select=id'),db('tarefa_responsaveis?pessoa_id=eq.'+encodeURIComponent(link.pessoa_id)+'&tarefa_id=eq.'+encodeURIComponent(link.tarefa_id)+'&select=tarefa_id')]);
  if(!people.length||!assigned.length)return reply({erro:'Acesso indisponível'},403);
  if(d.action==='listar')return reply({sugestoes:await db('sugestoes_tarefas?pessoa_id=eq.'+encodeURIComponent(link.pessoa_id)+'&select=id,numero,descricao,estado,observacoes,criado_em,decidido_em,tipo&order=criado_em.desc&limit=100')});
  if(!['enviar','enviar_duvida'].includes(d.action)||typeof d.descricao!=='string'||!d.descricao.trim()||d.descricao.length>2000||!uuid(d.requisicao))return reply({erro:'Descreva a sugestão em até 2000 caracteres'},400);
  return reply({sugestao:await db('rpc/fsj_enviar_sugestao_tipo',{p_token:d.token,p_descricao:d.descricao,p_requisicao:d.requisicao,p_tipo:d.action==='enviar_duvida'?'duvida':'sugestao'})});
 }catch(error){return reply({erro:error instanceof SyntaxError?'Pedido inválido':String((error as Error).message||'Falha ao registrar')},400);}
});
