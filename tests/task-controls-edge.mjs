import {test} from 'node:test';import assert from 'node:assert/strict';
let handler;globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://test.invalid':n==='SUPABASE_SERVICE_ROLE_KEY'?'test-only':undefined},serve:h=>handler=h};
await import('../supabase/functions/resposta-tarefa/index.ts');
const token='00000000-0000-4000-8000-000000000061';
async function request(action,{visitor=false,open=true,folga=false,invalid=false}={}){
 const original=globalThis.fetch;let rpc;
 globalThis.fetch=async(url,options={})=>{
  const p=new URL(url).pathname.replace('/rest/v1/','');
  if(p.startsWith('fsj_titularidade'))return Response.json([]);
  if(p==='rpc/fsj_horario_resposta')return Response.json(open);
  if(p==='rpc/fsj_link_resposta_vigente')return Response.json(true);
  if(p.startsWith('links_resposta'))return Response.json(invalid?[]:[{pessoa_id:'pessoa-ficticia',tarefa_id:'tarefa-ficticia',dia:'2026-10-29',expira_em:'2099-01-01'}]);
  if(p==='tarefas')return Response.json([{descricao:'Teste',periodicidade:'pontual'}]);
  if(p==='pessoas')return Response.json([{ativo:true,nome:'Fictício',tipo:visitor?'Visitante':'Funcionário'}]);
  if(p==='tarefa_responsaveis')return Response.json([{}]);
  if(p.includes('progresso'))return Response.json([]);
  if(/^rpc\/fsj_(iniciar_tarefa|suspender_tarefa|registrar_resposta)$/.test(p)){
   rpc={path:p,payload:JSON.parse(options.body)};
   if(folga)return new Response('FOLGA_SEMANAL_PENDENTE',{status:400});
   return Response.json({id:'test-only',execucao:{estado:action==='suspend'?'suspensa':'em_andamento'}});
  }
  throw Error('Requisição inesperada: '+p);
 };
 try{const r=await handler(new Request('https://test.invalid',{method:'POST',headers:{Origin:'https://urbanopos.github.io','Content-Type':'application/json'},body:JSON.stringify({token,action,resposta:'nao',justificativa:'Motivo de teste',pessoa_id:'forjada'})}));return {status:r.status,body:await r.json(),rpc};}
 finally{globalThis.fetch=original;}
}
test('início e suspensão usam apenas o token validado',async()=>{for(const action of ['start','suspend']){const r=await request(action);assert.equal(r.status,200);assert.deepEqual(r.rpc.payload,{p_token:token});}});
test('NÃO e justificativa chegam juntos à transação de resposta',async()=>{const r=await request('submit');assert.equal(r.status,200);assert.equal(r.rpc.payload.p_resposta,'nao');assert.equal(r.rpc.payload.p_justificativa,'Motivo de teste');});
test('folga pendente informa o motivo no início e na resposta',async()=>{for(const action of ['start','submit']){const r=await request(action,{folga:true});assert.equal(r.status,409);assert.equal(r.body.codigo,'folga_semanal_pendente');}});
test('visitante, link inexistente e fora do expediente não gravam',async()=>{for(const action of ['start','suspend','submit'])for(const options of [{visitor:true},{open:false},{invalid:true}]){const r=await request(action,options);assert(r.status>=400);assert.equal(r.rpc,undefined);}});
