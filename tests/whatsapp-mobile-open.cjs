const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||'index.html','utf8');
const fn=html.slice(html.indexOf('async function fsjEnviarIndividual'),html.indexOf("document.addEventListener('visibilitychange',()=>{if(!document.hidden)fsjRefreshManualStatus();",html.indexOf('async function fsjEnviarIndividual')));
async function run(blocked=false,cancel=false,fail=false,userAgent='Windows'){
 let openedURL='',closed=false;
 const tab={location:{replace:u=>openedURL=u},close:()=>closed=true};
 const ctx={fsjPainelPronto:true,window:{open:()=>blocked?null:tab},navigator:{userAgent},S:{people:[{id:'owner',nick:'Urbano'}]},fsjIndividualBusy:new Set(),fsjManualConfirmed:()=>false,fsjApplyManualState:()=>{},fsjManualStates:new Map(),fsjManualVersion:0,api:async()=>{if(fail)throw Error('falha');return {phone:'5581999999999',text:'Teste & mensagem'}},confirm:()=>!cancel};
 vm.createContext(ctx);vm.runInContext(fn,ctx);const status={},fallback={};await ctx.fsjEnviarIndividual('owner',{},status,fallback);return {openedURL,closed,status,fallback};
}
(async()=>{const ok=await run();assert.equal(new URL(ok.openedURL).hostname,'web.whatsapp.com');assert.equal(new URL(ok.openedURL).searchParams.get('text'),'Teste & mensagem');assert.equal(ok.fallback.hidden,false);assert.equal(ok.closed,false);
const blocked=await run(true);assert(blocked.status.textContent.includes('bloqueou'));assert(blocked.fallback.href.startsWith('https://web.whatsapp.com/send?'));
assert.equal((await run(false,true)).closed,true);assert.equal((await run(false,false,true)).closed,true);
for(const ua of ['Android','iPhone']){
 const m=await run(false,false,false,ua);const u=new URL(m.openedURL);assert.equal(u.hostname,'wa.me');assert.equal(u.pathname,'/5581999999999');assert.equal(u.searchParams.get('text'),'Teste & mensagem');assert(m.fallback.textContent.includes('Urbano'));
 const blockedMobile=await run(true,false,false,ua);assert.equal(blockedMobile.fallback.hidden,false);assert(blockedMobile.fallback.href.includes('text='));assert.equal(blockedMobile.fallback.target,'_blank');
}
console.log('PASS: abertura da conversa com mensagem, alternativa para pop-up bloqueado e fechamento em cancelamento/falha.');})().catch(e=>{console.error(e);process.exitCode=1;});