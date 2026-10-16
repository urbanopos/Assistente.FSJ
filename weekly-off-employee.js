let folgaAgenda=null,folgaBusy=false,folgaEditing=false;
const folgaBox=document.getElementById('folgaSemanal');
const folgaEndpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/folgas-semana';
function folgaDate(day,n=0){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function folgaLabel(day){return new Date(day+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'America/Recife',weekday:'short',day:'2-digit',month:'2-digit'})}
async function folgaPost(body){const r=await fetch(folgaEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,token}),signal:AbortSignal.timeout(30000)});const d=await r.json();if(!r.ok)throw Error(d.erro||'Não foi possível registrar a folga');return d.agenda;}
function renderFolga(){
 folgaBox.replaceChildren();
 const title=document.createElement('h2');title.textContent=folgaAgenda.dia?'Folga semanal registrada':'Tarefa semanal: informe seu dia de folga';folgaBox.append(title);
 const note=document.createElement('p');note.textContent=folgaAgenda.bloqueada_gestor?'Data definida pelo gestor. Você pode consultar, mas não alterar.':'Marque um dia desta semana. Não haverá envio diário de tarefas na data escolhida.';folgaBox.append(note);
 if(folgaAgenda.dia&&!folgaEditing){
  note.textContent=folgaAgenda.bloqueada_gestor?'Data definida pelo gestor. Você pode consultar, mas não alterar.':'Sua folga semanal está registrada.';
  const selected=document.createElement('p');selected.id='folgaStatus';selected.setAttribute('role','status');selected.textContent='Folga: '+folgaLabel(folgaAgenda.dia);folgaBox.append(selected);
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
async function carregarFolgaEmpregado(){if(!token||folgaBusy)return;try{folgaAgenda=await folgaPost({action:'calendar'});renderFolga();}catch(e){folgaBox.textContent='Calendário de folga indisponível: '+e.message;}}
carregarFolgaEmpregado();document.addEventListener('visibilitychange',()=>{if(!document.hidden)carregarFolgaEmpregado()});
