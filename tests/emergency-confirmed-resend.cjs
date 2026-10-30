const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const state=html.slice(html.indexOf('function fsjManualDay('),html.indexOf('async function fsjRefreshManualStatus'));
const send=html.slice(html.indexOf('async function fsjEnviarEmergencialIntegrado'),html.indexOf('async function fsjEmergenciaProprietario'));
const confirmFn=html.slice(html.indexOf('async function fsjConfirmarManual'),html.indexOf('function fsjIndividualControls'));
function control(id,emergency=true){return {row:{isConnected:true},p:{id,active:true,whatsapp7h:true},button:{},confirm:{},fallback:{hidden:false},status:{textContent:'Mensagem pronta'},emergency,prepared:true};}
(async()=>{
 const carlos=control('carlos'),other=control('other'),normal=control('carlos',false),inactive=control('inactive'),off=control('off'),unprepared=control('new');
 inactive.p.active=false;off.p.whatsapp7h=false;unprepared.prepared=false;
 const controls=new Set([carlos,other,normal,inactive,off,unprepared]),states=new Map(),busy=new Set(),urls=[],requests=[];
 const ctx={Intl,Date,fsjManualControls:controls,fsjManualStates:states,fsjIndividualBusy:busy,fsjPainelPronto:true,window:{open:()=>({location:{replace:u=>urls.push(u)},focus(){}})},navigator:{userAgent:'Android'},api:async(p,o)=>{const data=JSON.parse(o.body);requests.push(data);ctx.fsjApplyManualState();return {phone:data.pessoa_id==='carlos'?'5581999999999':'5581888888888',text:'Mensagem '+data.pessoa_id,confirmado:data.pessoa_id==='carlos'};},confirm:()=>{throw Error('Confirmação já existente não deve repetir');}};
 vm.createContext(ctx);vm.runInContext(state+'\n'+send+'\n'+confirmFn,ctx);
 states.set('carlos',{dia:ctx.fsjManualDay(),confirmado_em:new Date().toISOString()});
 ctx.fsjApplyManualState();
 assert.equal(carlos.button.disabled,false);assert.equal(normal.button.disabled,true);assert.equal(normal.button.textContent,'Envio Confirmado');
 assert.equal(carlos.fallback.hidden,false);assert.equal(carlos.status.textContent,'Mensagem pronta');assert.equal(carlos.confirm.hidden,true);
 assert.equal(other.button.disabled,false);assert.equal(other.confirm.hidden,false);assert.equal(unprepared.confirm.hidden,true);
 assert.equal(inactive.button.disabled,true);assert.equal(off.button.disabled,true);
 busy.add('carlos');ctx.fsjApplyManualState();assert.equal(carlos.button.disabled,true);busy.clear();
 await ctx.fsjEnviarEmergencialIntegrado('carlos',carlos.button,carlos.status);
 assert.equal(carlos.button.disabled,false);assert.equal(carlos.fallback.hidden,false);assert.match(carlos.status.textContent,/Já há envio registrado/);
 await ctx.fsjEnviarEmergencialIntegrado('other',other.button,other.status);
 assert.deepEqual(requests.map(x=>x.pessoa_id),['carlos','other']);assert.equal(new URL(urls[1]).pathname,'/5581888888888');
 await ctx.fsjConfirmarManual('carlos','Carlos');
 assert.equal(requests.length,2);
 console.log('PASS: emergência disponível após confirmação, destinatários independentes, estados preservados, envio comum e cadastros bloqueados protegidos.');
})().catch(e=>{console.error(e);process.exitCode=1;});
