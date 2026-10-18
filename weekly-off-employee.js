let folgaAgenda=null,folgaBusy=false,folgaEditing=false;
let folgaBox=document.getElementById('folgaSemanal');
if(!folgaBox){folgaBox=document.createElement('section');folgaBox.id='folgaSemanal';folgaBox.className='card';document.querySelector('main').prepend(folgaBox);}
let folgaLiberada=false;
function folgaGate(){
 folgaLiberada=!!folgaAgenda?.dia;
 for(const id of ['tasks','taskAnswer','form']){const e=document.getElementById(id);if(e)e.inert=!folgaLiberada;}
 document.dispatchEvent(new CustomEvent('fsj:folga',{detail:{liberada:folgaLiberada}}));
}
function folgaAvisar(){folgaBox.scrollIntoView?.({block:'start'});document.getElementById('folgaDia')?.focus();}
document.addEventListener('click',event=>{if(folgaLiberada||folgaBox.contains(event.target))return;if(event.target.closest('#tasks a,#startTask,#taskAnswer button,#form button')){event.preventDefault();event.stopImmediatePropagation();folgaAvisar();}},true);
folgaGate();
const folgaEndpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/folgas-semana';
function folgaDate(day,n=0){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function folgaLabel(day){return new Date(day+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'America/Recife',weekday:'short',day:'2-digit',month:'2-digit'})}
async function folgaPost(body){const r=await fetch(folgaEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,token}),signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error(d.erro||'Não foi possível registrar a folga');return d.agenda;}
function renderFolga(){
 folgaGate();
 folgaBox.replaceChildren();
 const title=document.createElement('h2');title.textContent=folgaAgenda.dia?'Folga semanal registrada':'Tarefa semanal: informe seu dia de folga';folgaBox.append(title);
 if(!folgaLiberada){const warning=document.createElement('p');warning.setAttribute('role','alert');warning.textContent='Registros de tarefas bloqueados. Escolha e confirme pelo menos um dia de folga da semana que se inicia na segunda-feira.';folgaBox.append(warning);const choose=document.createElement('button');choose.type='button';choose.textContent='Escolher dia de folga';choose.onclick=folgaAvisar;folgaBox.append(choose);}
 const note=document.createElement('p');note.textContent=folgaAgenda.bloqueada_gestor?'Data definida pelo gestor. Você pode consultar, mas não alterar.':'Marque um dia desta semana. Não haverá envio diário de tarefas na data escolhida.';folgaBox.append(note);
 if(folgaAgenda.dia&&!folgaEditing){
  note.textContent=folgaAgenda.bloqueada_gestor?'Data definida pelo gestor. Você pode consultar, mas não alterar.':'Sua folga semanal está registrada.';
  const selected=document.createElement('span');selected.id='folgaStatus';selected.setAttribute('role','status');selected.textContent='Folga: '+folgaLabel(folgaAgenda.dia);note.append(document.createTextNode(' '),selected);
  if(!folgaAgenda.bloqueada_gestor){const change=document.createElement('button');change.type='button';change.textContent='Alterar minha folga';change.onclick=()=>{folgaEditing=true;renderFolga();};folgaBox.append(change);}
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
 if(!folgaAgenda.bloqueada_gestor){const b=document.createElement('button');b.type='button';b.textContent=folgaAgenda.dia?'Alterar minha folga':'Confirmar folga';b.onclick=async()=>{
  const day=folgaBox.querySelector('select[name="folga-dia"]')?.value;if(!day){status.textContent='Escolha um dia.';return;}b.disabled=true;folgaBusy=true;
  try{folgaAgenda=await folgaPost({action:'choose',dia:day});folgaEditing=false;renderFolga();document.getElementById('folgaStatus').textContent='Folga salva: '+folgaLabel(folgaAgenda.dia)+'.';}catch(e){status.textContent=e.message;b.disabled=false;}finally{folgaBusy=false;}
 };folgaBox.append(b);}
}
async function carregarFolgaEmpregado(){if(!token||folgaBusy)return;try{folgaAgenda=await folgaPost({action:'calendar'});renderFolga();}catch(e){folgaAgenda=null;folgaGate();folgaBox.textContent='Registros bloqueados: não foi possível consultar a folga. '+e.message;const retry=document.createElement('button');retry.textContent='Consultar e escolher folga';retry.onclick=carregarFolgaEmpregado;folgaBox.append(retry);}}
carregarFolgaEmpregado();document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregarFolgaEmpregado()});

setInterval(()=>{if(!document.hidden&&!folgaBusy&&!folgaEditing&&!document.getElementById('folgaDia')?.value)carregarFolgaEmpregado()},60000);
