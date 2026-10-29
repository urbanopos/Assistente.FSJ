const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
async function run(name,time,action,email='urbanopos@yahoo.com.br'){
 let handler,calls=0;
 class Clock extends Date{constructor(...a){super(...(a.length?a:[time]));}static now(){return Date.parse(time);}}
 const context={Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://test.invalid':k==='SUPABASE_SERVICE_ROLE_KEY'?'test':undefined},serve:fn=>handler=fn},Date:Clock,Intl,Response,AbortSignal,File,console,crypto:require('node:crypto').webcrypto,fetch:async(url)=>{
 calls++;if(url.includes('/auth/'))return Response.json({email});
 if(url.includes('rpc/fsj_pode_enviar'))return Response.json(true);
 if(url.includes('rpc/fsj_preparar_calendario'))return Response.json(null);
 if(url.includes('/pessoas?'))return Response.json([{nome:'Pessoa',whatsapp:'81999999999'}]);
 if(url.includes('/quadros_do_dia?'))return Response.json(name==='envio-manual'?[{token:'test',expira_em:'2026-10-30T03:00:00Z'}]:[]);
 if(url.includes('/links_resposta?'))return Response.json([]);
 if(url.includes('rpc/fsj_link_supervisao'))return Response.json(null);
 return Response.json([]);
 }};
 vm.createContext(context);vm.runInContext(stripTypeScriptTypes(fs.readFileSync('supabase/functions/'+name+'/index.ts','utf8')),context);
 const request=new Request('https://test.invalid',{method:'POST',headers:{origin:'https://urbanopos.github.io','content-type':'application/json',...(name==='envio-manual'?{authorization:'Bearer test'}:{})},body:JSON.stringify({action,pessoa_id:'person',token:'11111111-1111-4111-8111-111111111111'})});
 const result=await handler(request);return {status:result.status,data:await result.json(),calls};
}
(async()=>{
 const early='2026-10-29T09:59:00Z',open='2026-10-29T10:00:00Z';
 const sent=await run('envio-manual',early,'individual');assert.equal(sent.status,200);assert(sent.data.text.includes('quadro.html'));
 assert.equal((await run('envio-manual',early,'individual','other@example.com')).status,403);
 for(const action of ['board','detail','reminders','start','submit']){const r=await run('resposta-tarefa',early,action);assert.equal(r.status,403);assert.equal(r.data.codigo,'consulta_antes_7h');assert.equal(r.calls,0);}
 for(const action of ['available','demands','questions','review'])assert.equal((await run('supervisao',early,action)).data.codigo,'consulta_antes_7h');
 const after=await run('resposta-tarefa',open,'board');assert.notEqual(after.data.codigo,'consulta_antes_7h');assert(after.calls>0);
 console.log('PASS: envio às 6h59, autenticação preservada, consulta e ações bloqueadas antes das 7h, liberação às 7h (Recife).');
})().catch(e=>{console.error(e);process.exitCode=1;});