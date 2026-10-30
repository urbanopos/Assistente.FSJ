const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const h=fs.readFileSync('index.html','utf8'),code=h.slice(h.indexOf('function fsjMostrarAvisoEmergencia'),h.indexOf('async function fsjEmergenciaProprietario'));
async function run(kind){
 const c={p:{id:'carlos',name:'Carlos'},button:{},status:{},fallback:{},confirm:{}},alerts=[],urls=[];
 const tab={location:{href:'about:blank',replace:u=>urls.push(u)},close(){this.closed=true;}};
 const ctx={Intl,Date,encodeURIComponent,Promise,navigator:{userAgent:'Android'},window:{open:()=>tab},alert:()=>{throw Error("Não usar alerta nativo");},fsjPainelPronto:true,fsjIndividualBusy:new Set(),fsjManualControls:new Set([c]),fsjApplyManualState(){},fsjManualConfirmed:()=>false,
 api:async path=>{
  if(path.startsWith('/functions/'))throw Error(JSON.stringify({erro:'Envio bloqueado: confira cadastro ativo, recebimento às 7h, folgas, férias e feriados.'}));
  if(kind==='error')throw Error('offline');
  const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Recife'}).format(new Date());
  if(path.includes('/pessoas?'))return [{nome:'Carlos',ativo:true,receber_tarefas_whatsapp:true,folgas_datas:kind==='monthly'?[day]:[],folgas_motivos:{[day]:'Folga pessoal'}}];
  if(path.includes('/folgas_semana?'))return kind==='weekly'?[{dia:day}]:[];
  if(path.includes('/feriados_fsj?'))return [];
  return kind==='compensation'?[{dia:'2026-11-02',folga_compensatoria:day}]:[];
 }};
 ctx.document={getElementById:id=>id==='fsjEmergencyNotice'?{open:false,showModal(){this.open=true;alerts.push(ctx.message);},set onclose(v){}}:{set textContent(v){ctx.message=v;}}};
 vm.createContext(ctx);vm.runInContext(code,ctx);await ctx.fsjEnviarEmergencialIntegrado('carlos',c.button,c.status);
 assert.equal(alerts.length,1);assert.equal(urls.length,0);assert.equal(c.confirm.hidden,true);assert.equal(c.fallback.hidden,true);assert.equal(tab.closed,true);assert.match(c.status.textContent,/Carlos/);assert.equal(alerts[0],c.status.textContent);if(kind!=='error')assert.match(alerts[0],/O destinatário executor \(Carlos\) está de folga/);
 assert.match(c.status.textContent,kind==='weekly'?/Folga semanal/:kind==='monthly'?/Folga pessoal/:kind==='compensation'?/Folga compensatória/:/Não foi possível consultar/);
}
(async()=>{for(const k of ['weekly','monthly','compensation','error'])await run(k);console.log('PASS: aviso específico por pessoa, folga semanal/mensal/compensação, falha de consulta sem afirmar folga, sem abrir envio ou confirmar.');})().catch(e=>{console.error(e);process.exitCode=1;});