const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
const path=require('node:path'),root=fs.existsSync(__dirname+'/index.html')?__dirname:path.resolve(__dirname,'../..');
const source=file=>fs.readFileSync(file.endsWith('.ts')?(fs.existsSync(__dirname+'/'+file)?__dirname+'/'+file:root+'/supabase/functions/'+file.slice(0,-3)+'/index.ts'):root+'/'+file,'utf8');

(async()=>{
 let handler,mode='ok';
 const ctx={Response,Request,URL,AbortSignal,console,JSON,Date,Object,Error,
 Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://db.example':k==='SUPABASE_SERVICE_ROLE_KEY'?'server-key':undefined},serve:fn=>handler=fn},
 fetch:async(url,opt={})=>{
  if(url.endsWith('/auth/v1/user'))return Response.json({id:'owner-auth',email:'urbanopos@yahoo.com.br'},{status:mode==='bad-auth'?401:200});
  if(url.includes('fsj_titularidade'))return Response.json(mode==='not-owner'?[]:[{pessoa_id:'owner'}]);
  if(url.includes('tarefas?periodicidade'))return Response.json([{id:'daily'}]);
  if(url.includes('rpc/fsj_progresso_diario')){
   const args=JSON.parse(opt.body);assert.deepEqual(args.p_tarefas,['daily']);
   assert.equal(args.p_mes,'2026-10-01');assert.equal(args.p_pessoa,'p');
   return Response.json({daily:{rotulo:'19 / 25'}});
  }throw Error('Unexpected '+url);
 }};
 vm.createContext(ctx);vm.runInContext(stripTypeScriptTypes(source('supervisao.ts')),ctx);
 const req=(body,auth=true,origin='https://urbanopos.github.io')=>new Request('https://functions.example/supervisao',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(auth?{Authorization:'Bearer owner'}:{})},body:JSON.stringify(body)});
 const body={action:'daily-progress',mes:'2026-10',pessoa_id:'p'};
 let r=await handler(req(body));assert.equal(r.status,200);assert.equal((await r.json()).resumos.daily.rotulo,'19 / 25');
 assert.equal((await handler(req(body,false))).status,401);
 mode='bad-auth';assert.equal((await handler(req(body))).status,401);
 mode='not-owner';assert.equal((await handler(req(body))).status,403);
 mode='ok';assert.equal((await handler(req({...body,mes:'2026-13'}))).status,400);
 assert.equal((await handler(req(body,true,'https://outsider.example'))).status,403);
 // Delayed response affects the scheduled day, never the day of submission.
 let taskHandler;
 const taskCtx={...ctx,Deno:{...ctx.Deno,serve:fn=>taskHandler=fn}};
 vm.createContext(taskCtx);vm.runInContext(stripTypeScriptTypes(source('resposta-tarefa.ts')),taskCtx);
 const task={id:'t',diaria:true,situacao:'Em aberto'},answers=[{tarefa_id:'t',tipo:'sim',dia_previsto:'2026-10-20',criado_em:'2026-10-22T02:59:59Z'}];
 taskCtx.t=task;taskCtx.a=answers;
 assert.equal(vm.runInContext("taskSituation(t,a,'2026-10-20')",taskCtx),'Concluída');
 assert.equal(vm.runInContext("taskSituation(t,a,'2026-10-21')",taskCtx),'Em aberto');
 console.log('PASS: owner endpoint, missing/invalid identity, owner binding, invalid month/origin and scheduled-day state');
})().catch(e=>{console.error(e);process.exitCode=1;});

