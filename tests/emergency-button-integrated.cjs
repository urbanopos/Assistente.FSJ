const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||'index.html','utf8');
const fn=html.slice(html.indexOf('async function fsjEmergenciaProprietario'),html.indexOf('function fsjRenderEmergenciaPessoas'));
(async()=>{
 const calls=[],control={p:{id:'owner'},row:{},button:{disabled:false},status:{}},select={};
 const ctx={fsjPainelPronto:true,window:{open:()=>{throw Error('Não deve abrir envio manual');}},fsjLoadOwnership:async()=>calls.push('identity'),fsjProprietario:{pessoa_id:'owner'},S:{people:[{id:'owner'}]},fsjRenderEmergenciaPessoas:()=>{},fsjManualControls:new Set([control]),document:{getElementById:id=>id==='fsjEmergenciaPessoa'?select:{contains:r=>r===control.row}},fsjEnviarEmergencialIntegrado:async(id)=>{assert.equal(id,'owner');calls.push('integrated');},alert:()=>calls.push('blocked')};
 vm.createContext(ctx);vm.runInContext(fn,ctx);await ctx.fsjEmergenciaProprietario();assert.deepEqual(calls,['identity','integrated']);assert.equal(select.value,'owner');
 calls.length=0;ctx.fsjProprietario=null;await ctx.fsjEmergenciaProprietario();assert.deepEqual(calls,['identity','blocked']);
 assert(html.includes('box.append(fsjIndividualControls(p,true,true))'));assert(html.includes('confirmation.hidden=emergency'));
 console.log('PASS: botão de emergência solicita executor para destinatário oficial, sem abrir WhatsApp ou confirmação manual.');
})().catch(e=>{console.error(e);process.exitCode=1;});