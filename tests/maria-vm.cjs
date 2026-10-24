const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('maria-vm.js','utf8'),html=fs.readFileSync('index.html','utf8');
async function main(){
 let calls=[];const ctx=vm.createContext({URL,DOMException,AbortSignal,FSJ_VIDEO_VM_URL:'https://192.168.1.114/',recuperarAcessoGestor:async()=> 'owner-fixture',renovarSessao:async()=> 'renewed-fixture',fetch:async(url,options)=>{calls.push({url,options});return {status:200,ok:true,json:async()=>({mode:'documental',answer:'RAM verificada.',actions:[{acao:'unsafe'}]})}}});vm.runInContext(source,ctx);
 const answer=await ctx.mariaConsultarVM('qual memória?');assert.equal(answer.answer,'RAM verificada.');assert.equal(answer.actions.length,0);assert.equal(calls[0].options.credentials,'omit');assert.equal(calls[0].options.redirect,'error');assert.equal(JSON.parse(calls[0].options.body).message,'qual memória?');
 calls=[];ctx.recuperarAcessoGestor=async()=>null;await assert.rejects(()=>ctx.mariaConsultarVM('teste'),/Proprietário/);assert.equal(calls.length,0);
 ctx.recuperarAcessoGestor=async()=> 'owner-fixture';ctx.fetch=async()=>({status:403,ok:false,json:async()=>({error:'Não autorizado.'})});await assert.rejects(()=>ctx.mariaConsultarVM('teste'),/Não autorizado/);
 const controller=new AbortController();controller.abort();await assert.rejects(()=>ctx.mariaConsultarVM('teste',controller.signal),{name:'AbortError'});
 const script=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('async function brisaConsultarIA'));
 vm.runInContext(script.slice(script.indexOf('async function brisaConsultarIA'),script.indexOf('async function brisaVerificarIA')),ctx);
 ctx.mariaConsultarVM=async()=>{throw Error('Não deveria acessar VM para consulta já respondida.')};assert.equal(await ctx.brisaConsultarIA('tarefas',{answer:'Há duas tarefas verificadas.'}),'Há duas tarefas verificadas.');
 assert(!html.includes("api('/functions/v1/brisa-chat'"));assert(!html.includes("fetch(ARMAZ_URL+'/functions/v1/brisa-chat'"));assert(html.includes('maria-vm.js?v=20261024-maria-gravar-pergunta-09'));
 console.log('PASS: consulta documental, autenticação, resposta sem ações, cancelamento e tarefas locais sem consulta ao modelo.');
}main().catch(e=>{console.error(e);process.exit(1)});
