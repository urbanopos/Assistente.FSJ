const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||'index.html','utf8');
const fn=html.slice(html.indexOf('async function fsjEnviarEmergencialIntegrado'),html.indexOf('async function fsjEmergenciaProprietario'));
async function run(ua,blocked=false){let url='',calls=[];const button={},status={},control={p:{id:'chosen',nick:'Escolhido'},button,fallback:{},confirm:{hidden:true}};const tab={location:{replace:u=>url=u},close:()=>{}};const ctx={fsjPainelPronto:true,window:{open:()=>{calls.push('open');return blocked?null:tab}},navigator:{userAgent:ua},fsjIndividualBusy:new Set(),fsjManualControls:new Set([control]),fsjApplyManualState:()=>{},fsjManualConfirmed:()=>false,api:async(path,opts)=>{assert.equal(path,'/functions/v1/envio-manual');assert.equal(JSON.parse(opts.body).pessoa_id,'chosen');calls.push('prepare');return {phone:'5581999999999',text:'Mensagem & teste'};}};vm.createContext(ctx);vm.runInContext(fn,ctx);await ctx.fsjEnviarEmergencialIntegrado('chosen',button,status);return {url,calls,control};}
(async()=>{for(const ua of ['Windows','Android','iPhone']){const r=await run(ua);assert.deepEqual(r.calls,['open','prepare']);const u=new URL(r.url);assert.equal(u.searchParams.get('text'),'Mensagem & teste');assert.equal(ua==='Windows'?u.searchParams.get('phone'):u.pathname.slice(1),'5581999999999');assert.equal(r.control.confirm.hidden,false);const b=await run(ua,true);assert.equal(b.control.fallback.hidden,false);assert(b.control.fallback.href.includes('text='));}assert(!fn.includes('emergency-agent'));
const button={},status={},control={p:{id:'chosen',nick:'Escolhido'},button,fallback:{},confirm:{}};
let opens=0,focuses=0,closed=false,urls=[];
const tab={get closed(){return closed;},location:{replace:u=>urls.push(u)},focus:()=>focuses++,close:()=>{closed=true;}};
const ctx={fsjPainelPronto:true,window:{open:(url,name)=>{assert.equal(name,'fsjWhatsAppEmergencial');opens++;return tab;}},navigator:{userAgent:'Windows'},fsjIndividualBusy:new Set(),fsjManualControls:new Set([control]),fsjApplyManualState:()=>{},fsjManualConfirmed:()=>false,api:async()=>({phone:'5581999999999',text:'Primeira'})};
vm.createContext(ctx);vm.runInContext(fn,ctx);
await ctx.fsjEnviarEmergencialIntegrado('chosen',button,status);
ctx.api=async()=>({phone:'5581888888888',text:'Segunda'});
await ctx.fsjEnviarEmergencialIntegrado('chosen',button,status);
assert.equal(opens,1);assert.equal(urls.length,2);assert.equal(new URL(urls[1]).searchParams.get('phone'),'5581888888888');assert(focuses>=2);
closed=true;await ctx.fsjEnviarEmergencialIntegrado('chosen',button,status);assert.equal(opens,2);
assert.equal(control.fallback.target,'fsjWhatsAppEmergencial');console.log('PASS: destinatário e mensagem corretos; reutiliza a aba e só reabre após fechamento; alternativa não cria abas sem nome.');})().catch(e=>{console.error(e);process.exitCode=1;});