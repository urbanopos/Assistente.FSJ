import {test} from 'node:test';import assert from 'node:assert/strict';
let handler;globalThis.Deno={env:{get:n=>n==='SUPABASE_URL'?'https://test.invalid':n==='SUPABASE_SERVICE_ROLE_KEY'?'fake-key':undefined},serve:h=>{handler=h;}};
await import('../supabase/functions/folgas-semana/index.ts');
const call=body=>handler(new Request('https://test.invalid',{method:'POST',headers:{Origin:'https://urbanopos.github.io','Content-Type':'application/json'},body:JSON.stringify(body)}));
test('empregado não pode executar ações de gestor sem sessão',async()=>{const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('Nao deveria consultar banco');};try{assert.equal((await call({action:'manager-set',token:'00000000-0000-4000-8000-000000000001'})).status,401);}finally{globalThis.fetch=old;}});
test('escolha vincula apenas token validado; ignora ID de outra pessoa enviado pelo cliente',async()=>{
 const old=globalThis.fetch;let payload;
 globalThis.fetch=async(url,opt)=>{assert.match(String(url),/rpc\/fsj_escolher_folga$/);payload=JSON.parse(opt.body);return new Response(JSON.stringify({bloqueada_gestor:false,dia:'2026-10-13'}));};
 try{const r=await call({action:'choose',token:'00000000-0000-4000-8000-000000000001',dia:'2026-10-13',pessoa_id:'outra-pessoa'});assert.equal(r.status,200);assert.deepEqual(Object.keys(payload).sort(),['p_dia','p_token']);}finally{globalThis.fetch=old;}
});
test('bloqueio do banco é devolvido ao empregado como erro',async()=>{const old=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({message:'Folga definida pelo gestor; alteracao bloqueada'}),{status:400});try{const r=await call({action:'choose',token:'00000000-0000-4000-8000-000000000001',dia:'2026-10-13'});assert.equal(r.status,400);assert.match((await r.json()).erro,/bloqueada/);}finally{globalThis.fetch=old;}});
