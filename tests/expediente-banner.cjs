const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{stripTypeScriptTypes}=require('node:module');
const root=process.argv[2]||'.';
function source(name){return fs.readFileSync(root==='.'?'supabase/functions/'+name+'/index.ts':root+'/'+name+'.ts','utf8');}
async function run(name,time,action){
 let handler,taskReads=0,gateCalls=0;
 class Clock extends Date{constructor(...a){super(...(a.length?a:[time]));}static now(){return Date.parse(time);}}
 const ctx={Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://test.invalid':k==='SUPABASE_SERVICE_ROLE_KEY'?'test':undefined},serve:fn=>handler=fn},Date:Clock,Intl,Response,AbortSignal,File,console,crypto:require('node:crypto').webcrypto,fetch:async(url,opt={})=>{
 if(url.includes('/rpc/fsj_horario_resposta')){
  gateCalls++;const instant=JSON.parse(opt.body).p_instante;assert.equal(instant,time);
  const t=new Date(instant).toISOString().slice(11,19);const seconds=Number(t.slice(0,2))*3600+Number(t.slice(3,5))*60+Number(t.slice(6,8))-3*3600;
  return Response.json(seconds>=25200&&seconds<=43200||seconds>=50400&&seconds<=58800);
 }
 if(url.includes('/tarefas?'))taskReads++;return Response.json([]);
 }};
 vm.createContext(ctx);vm.runInContext(stripTypeScriptTypes(source(name)),ctx);
 const r=await handler(new Request('https://test.invalid',{method:'POST',headers:{origin:'https://urbanopos.github.io','content-type':'application/json'},body:JSON.stringify({action,token:'11111111-1111-4111-8111-111111111111'})}));
 return {status:r.status,data:await r.json(),taskReads,gateCalls};
}
(async()=>{
 for(const [time,open] of [['06:59:59',false],['07:00:00',true],['11:59:59',true],['12:00:01',false],['13:59:59',false],['14:00:00',true],['16:20:00',true],['16:20:01',false],['23:00:00',false]]){
  const [h,m,s]=time.split(':');const utc='2026-10-29T'+String(Number(h)+3).padStart(2,'0')+':'+m+':'+s+'.000Z';
  if(Number(h)+3>23)continue;
  for(const [name,actions] of [['resposta-tarefa',['board','detail','start','submit','reminders']],['supervisao',['available','demands','questions','review']]]){
   for(const action of actions){const r=await run(name,utc,action);assert.equal(r.gateCalls,1);
    if(!open){assert.equal(r.status,403);assert.equal(r.data.codigo,'fora_expediente');assert.equal(r.taskReads,0);}
    else assert.notEqual(r.data.codigo,'fora_expediente');
   }
  }
 }
 for(const page of ['inicio-usuario.html','quadro.html','responder.html','supervisor.html']){
  const html=fs.readFileSync(root+'/'+page,'utf8');assert(html.includes('fsj-hours-banner.css'));assert(html.includes('fsj-hours-banner.js'));
  for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
 }
 console.log('PASS: expediente e descanso no servidor, sem conteúdo fora do horário; scripts e inclusão do banner em quatro páginas.');
})().catch(e=>{console.error(e);process.exitCode=1;});