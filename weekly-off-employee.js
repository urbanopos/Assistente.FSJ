let folgaAgenda=null,folgaBusy=false,folgaEditing=false;
let folgaBox=document.getElementById('folgaSemanal');
if(!folgaBox){folgaBox=document.createElement('section');folgaBox.id='folgaSemanal';folgaBox.className='card';document.querySelector('main').prepend(folgaBox);}
let folgaLiberada=false;
function folgaGate(){
 folgaLiberada=folgaAgenda?.exigir_folga_semanal===false||!!folgaAgenda?.dia;
 for(const id of ['taskAnswer','form']){const e=document.getElementById(id);if(e)e.inert=false;}
 document.dispatchEvent(new CustomEvent('fsj:folga',{detail:{liberada:folgaLiberada}}));
}
let folgaWarningWeek=null,folgaWarning=null,folgaWarningCount=0,folgaWarningNext=0;
let folgaRepeatTimer,folgaHideTimer;
function folgaEnsureWarning(){
 if(folgaWarning)return;
 folgaWarning=document.createElement('dialog');folgaWarning.id='fsjFolgaAviso';
 folgaWarning.setAttribute('aria-labelledby','fsjFolgaAvisoTitulo');
 folgaWarning.innerHTML='<p id="fsjFolgaAvisoTitulo">REGISTRE SUA FOLGA SEMANAL</p><p>A semana de referência identifica o período. Escolha e confirme o dia da sua folga. O gestor poderá alterá-lo.</p><button type="button">Escolher dia de folga</button>';
 document.body.append(folgaWarning);
 const style=document.createElement('style');
 style.textContent='#fsjFolgaAviso{box-sizing:border-box;width:min(420px,calc(100vw - 32px));max-height:calc(100dvh - 32px);margin:auto;padding:20px;border:2px solid #b91c1c;border-radius:14px;background:#fff;color:#213d2d;text-align:center;overflow:auto}#fsjFolgaAviso::backdrop{background:#102e2460}#fsjFolgaAvisoTitulo{color:#b91c1c;font-weight:800;animation:fsjFolgaPulse 1s ease-in-out 5}#fsjFolgaAviso button{max-width:100%;white-space:normal}@keyframes fsjFolgaPulse{50%{opacity:.35}}@media(prefers-reduced-motion:reduce){#fsjFolgaAvisoTitulo{animation:none}}';
 document.head.append(style);folgaWarning.querySelector('button').onclick=folgaAvisar;
}
function folgaAvisar(){
 if(folgaWarning?.open)folgaWarning.close();
 document.dispatchEvent(new CustomEvent('fsj:page-target',{detail:folgaBox}));
 document.getElementById('folgaDia')?.focus();
}
function folgaCancelarAvisos(){clearTimeout(folgaRepeatTimer);clearTimeout(folgaHideTimer);if(folgaWarning?.open)folgaWarning.close();}
async function folgaRepetirAviso(){
 if(folgaLiberada||folgaWarningCount>=3||document.hidden)return;
 if(folgaBusy){folgaRepeatTimer=setTimeout(folgaRepetirAviso,1000);return;}
 try{
  const agenda=await folgaPost({action:'calendar'});
  if(folgaBusy||folgaLiberada)return;
  if(agenda.dia||agenda.exigir_folga_semanal===false){folgaAgenda=agenda;renderFolga();return;}
  folgaAgenda=agenda;folgaMostrarAviso();
 }catch{/* Sem consulta confirmada, nao presumir pendencia. */}
}
function folgaMostrarAviso(){
 if(folgaLiberada){folgaCancelarAvisos();return;}
 if(!folgaAgenda||!location.pathname.endsWith('/responder.html'))return; return; // avisos apenas nas operações
 if(folgaWarningWeek!==folgaAgenda.semana){folgaCancelarAvisos();folgaWarningWeek=folgaAgenda.semana;folgaWarningCount=0;folgaWarningNext=0;}
 if(document.hidden||folgaWarningCount>=3||Date.now()<folgaWarningNext)return;
 folgaEnsureWarning();folgaWarningCount++;folgaWarningNext=Date.now()+30000;
 const title=folgaWarning.querySelector('#fsjFolgaAvisoTitulo');title.style.animation='none';void title.offsetWidth;title.style.animation='';
 if(!folgaWarning.open)folgaWarning.showModal();
 clearTimeout(folgaHideTimer);folgaHideTimer=setTimeout(()=>{if(folgaWarning?.open)folgaWarning.close();},5000);
 clearTimeout(folgaRepeatTimer);if(folgaWarningCount<3)folgaRepeatTimer=setTimeout(folgaRepetirAviso,30000);
}
document.addEventListener('click',event=>{
 if(folgaLiberada||folgaBox.contains(event.target))return;
 if(!event.target.closest('#startTask,#taskAnswer button,#form button'))return;
 let aviso=document.getElementById('fsjFolgaAvisoOperacao');
 if(!aviso){aviso=document.createElement('div');aviso.id='fsjFolgaAvisoOperacao';aviso.setAttribute('role','status');aviso.style.cssText='position:fixed;z-index:99999;left:12px;right:12px;top:12px;max-width:560px;margin:auto;background:#fff7dd;color:#493400;border:2px solid #b58a00;border-radius:10px;padding:12px;box-shadow:0 3px 12px #0003';document.body.append(aviso);}
 aviso.textContent='ATENÇÃO: Sua folga semanal ainda não foi registrada. Providencie o registro. Esta situação não impede o início ou a conclusão das tarefas.';
 clearTimeout(aviso.fsjTimer);aviso.fsjTimer=setTimeout(()=>aviso.remove(),4500);
},true);
folgaGate();
const folgaEndpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/folgas-semana';
function folgaDate(day,n=0){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function folgaLabel(day){return new Date(day+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'America/Recife',weekday:'short',day:'2-digit',month:'2-digit'})}
async function folgaPost(body){const r=await fetch(folgaEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,token}),signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error(d.erro||'Não foi possível registrar a folga');return d.agenda;}
function renderFolga(){
 folgaGate();
 folgaCancelarAvisos();
 folgaBox.replaceChildren();
 folgaBox.hidden=folgaAgenda?.exigir_folga_semanal===false;
 if(folgaBox.hidden)return;
 const title=document.createElement('h2');title.textContent=folgaAgenda.dia?'Folga semanal registrada':'Folga semanal';folgaBox.append(title);
 if(!folgaLiberada&&!folgaEditing){const choose=document.createElement('button');choose.type='button';choose.textContent='Escolher Folga';choose.onclick=()=>{folgaEditing=true;renderFolga();document.dispatchEvent(new CustomEvent('fsj:page-target',{detail:folgaBox}));};folgaBox.append(choose);return;}
 const note=document.createElement('p');note.textContent=folgaAgenda.bloqueada_gestor?'Data definida pelo gestor. Você pode consultar, mas não alterar.':'A semana de referência é apenas o período de contagem; não é uma folga registrada. Escolha e confirme um dia desta semana. O gestor poderá alterar a escolha. Não haverá envio diário de tarefas na data escolhida.';folgaBox.append(note);
 if(folgaAgenda.dia&&!folgaEditing){
  note.textContent=folgaAgenda.bloqueada_gestor?'Data definida pelo gestor. Você pode consultar, mas não alterar.':'Sua folga semanal está registrada.';
  const selected=document.createElement('span');selected.id='folgaStatus';selected.setAttribute('role','status');selected.textContent='Folga: '+folgaLabel(folgaAgenda.dia);note.append(document.createTextNode(' '),selected);
  // Escolha registrada: somente consulta; alteracoes cabem ao gestor autorizado.
  return;
 }
 const label=document.createElement('label');label.htmlFor='folgaDia';label.textContent='Dia da folga semanal';
 const select=document.createElement('select');select.id='folgaDia';select.name='folga-dia';select.disabled=!!folgaAgenda.bloqueada_gestor;
 select.add(new Option('Selecione um dia desta semana',''));
 for(let i=0;i<7;i++){
  const day=folgaDate(folgaAgenda.semana,i),option=new Option(folgaLabel(day),day);
  option.disabled=day<folgaAgenda.hoje;select.add(option);
 }
 select.value=folgaAgenda.dia||'';folgaBox.append(label,select);
 const status=document.createElement('p');status.id='folgaStatus';status.setAttribute('role','status');
 status.textContent=folgaAgenda.dia?'Folga: '+folgaLabel(folgaAgenda.dia):'Escolha pendente.';folgaBox.append(status);
 if(!folgaAgenda.bloqueada_gestor){const b=document.createElement('button');b.type='button';b.textContent='Confirmar folga';b.onclick=async()=>{
  const day=folgaBox.querySelector('select[name="folga-dia"]')?.value;if(!day){status.textContent='Escolha um dia.';return;}b.disabled=true;folgaBusy=true;
  try{folgaAgenda=await folgaPost({action:'choose',dia:day});folgaEditing=false;renderFolga();document.getElementById('folgaStatus').textContent='Folga salva: '+folgaLabel(folgaAgenda.dia)+'.';}catch(e){status.textContent=e.message;b.disabled=false;}finally{folgaBusy=false;}
 };folgaBox.append(b);}
}
async function carregarFolgaEmpregado(){if(!token||folgaBusy)return;try{folgaAgenda=await folgaPost({action:'calendar'});renderFolga();}catch(e){folgaAgenda=null;folgaGate();folgaBox.hidden=false;folgaBox.textContent='Consulta de folga indisponível: não foi possível consultar a folga. '+e.message;const retry=document.createElement('button');retry.textContent='Consultar e escolher folga';retry.onclick=carregarFolgaEmpregado;folgaBox.append(retry);}}
carregarFolgaEmpregado();document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregarFolgaEmpregado()});

setInterval(()=>{if(!document.hidden&&!folgaBusy&&!folgaEditing&&!document.getElementById('folgaDia')?.value)carregarFolgaEmpregado()},60000);

