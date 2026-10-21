const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module'),path=require('node:path');
const root=fs.existsSync(__dirname+'/index.html')?__dirname:path.resolve(__dirname,'../..');
const source=file=>fs.readFileSync(file.endsWith('.ts')?(fs.existsSync(root+'/'+file)?root+'/'+file:root+'/supabase/functions/'+file.slice(0,-3)+'/index.ts'):root+'/'+file,'utf8');
for(const file of ['index.html','responder.html']){
 for(const match of source(file).matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:file});
}
for(const file of ['completion-review.js','task-detail-manager.js'])new vm.Script(source(file),{filename:file});
for(const file of ['supervisao.ts','resposta-tarefa.ts'])new vm.Script(stripTypeScriptTypes(source(file)),{filename:file});
(async()=>{
 let handler,posted=0;
 const ctx={Request,Response,AbortSignal,console,JSON,Date,Error,Object,
 Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://db.example':k==='SUPABASE_SERVICE_ROLE_KEY'?'server-only':undefined},serve:f=>handler=f},
 fetch:async(url,options)=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:'owner-auth',email:'urbanopos@yahoo.com.br'});
  if(url.endsWith('/rpc/fsj_cancelar_conclusao')){const body=JSON.parse(options.body);assert.equal(body.p_auth,'owner-auth');assert.equal(body.p_motivo,'Refazer serviço');posted++;return Response.json({ok:true});}
  if(url.endsWith('/rpc/fsj_info_conclusao'))return Response.json({conclusoes:[]});
  throw Error('Unexpected '+url);
 }};
 vm.createContext(ctx);vm.runInContext(stripTypeScriptTypes(source('supervisao.ts')),ctx);
 const req=(data,auth=true)=>new Request('https://functions.example/supervisao',{method:'POST',headers:{Origin:'https://urbanopos.github.io','Content-Type':'application/json',...(auth?{Authorization:'Bearer session'}:{})},body:JSON.stringify(data)});
 const data={action:'reopen-completion',tarefa_id:'t',motivo:'Refazer serviço',requisicao:'13a00001-f504-456a-8d2b-987654321011',conclusao_id:'13a00001-f504-456a-8d2b-987654321001'};
 assert.equal((await handler(req(data,false))).status,401);
 assert.equal((await handler(req({...data,motivo:''}))).status,400);
 assert.equal((await handler(req(data))).status,200);assert.equal(posted,1);
 assert.equal((await handler(req({action:'completion-info',tarefa_id:'t'}))).status,200);
 console.log('PASS: syntax, owner endpoint authentication, required reason and validated actor');
})().catch(e=>{console.error(e);process.exitCode=1;});

