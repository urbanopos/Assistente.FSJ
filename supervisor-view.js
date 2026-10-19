function fsjCompareTaskPriority(a,b){const rank=t=>({urgente:0,prioritaria:1}[t.priority||t.prioridade]??2);return rank(a)-rank(b);}
function fsjTaskClass(priority,status,running=false){if(status==='Concluída')return 'fsj-task-completed';if(priority==='urgente')return 'fsj-priority fsj-urgent';if(priority==='prioritaria')return 'fsj-priority';if(status!=='Concluída'&&(running||status==='Em andamento'))return 'fsj-task-running';if(status==='Pendente')return 'fsj-task-pending';return 'fsj-task-open';}
function fsjApplyTaskColor(el,priority,status,running=false){if(!el)return;el.classList.remove('fsj-task-completed','fsj-task-open','fsj-task-running','fsj-task-pending','fsj-priority','fsj-urgent');el.classList.add(...fsjTaskClass(priority,status,running).split(' '));}
const supervisorToken=new URLSearchParams(location.hash.slice(1)).get('token')||'';
const supervisorApi='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/supervisao';
const supervisorStatus=document.getElementById('status'),supervisorTasks=document.getElementById('demandas');
let supervisorData=null,supervisorRequest=0;
document.getElementById('back').href='./quadro.html#token='+encodeURIComponent(supervisorToken);
function supervisorOptions(id,items,all){const input=document.getElementById(id),old=input.value;input.replaceChildren(new Option(all,''));items.forEach(x=>input.add(new Option(x.nome,x.id)));input.value=items.some(x=>x.id===old)?old:'';}
function supervisorRender(){
 supervisorTasks.replaceChildren();if(!supervisorData)return;
 const person=document.getElementById('filterPerson').value,group=document.getElementById('filterGroup').value,status=document.getElementById('filterStatus').value;
 const tasks=supervisorData.tarefas.filter(t=>(!person||t.responsaveis.some(p=>p.id===person))&&(!group||t.grupos.includes(group))&&(!status||t.situacao===status));
 if(!tasks.length){const p=document.createElement('p');p.className='card';p.textContent='Nenhuma demanda nessa seleção.';supervisorTasks.append(p);return;}
 tasks.sort(fsjCompareTaskPriority).forEach(t=>{const card=document.createElement('article');card.className='card task';const h=document.createElement('h2');const number=document.createElement('button');number.type='button';number.className='fsj-task-number';number.textContent=fsjTaskNumber(t.codigo_tarefa);number.addEventListener('click',()=>fsjOpenTaskDetails(t.codigo_tarefa,t.descricao,'Responsáveis: '+t.responsaveis.map(p=>p.nome).join(', ')+' • '+t.situacao));h.append(number);fsjApplyTaskColor(number,t.prioridade,t.situacao,(t.execucoes||[]).some(e=>e.estado==='em_andamento'));const state=document.createElement('span');state.className='pill';state.textContent=t.situacao+(t.diaria?' • Diária':'');const names=document.createElement('p');names.textContent='Responsáveis supervisionados: '+(t.responsaveis.map(p=>p.nome).join(', ')||'Tarefa de grupo autorizado');card.append(h,state,names);
  for(const e of t.execucoes||[]){const p=document.createElement('p');p.className='response';const when=x=>x?new Date(x).toLocaleString('pt-BR',{timeZone:'America/Recife'}):'';p.textContent=e.responsavel+' — '+(e.estado==='em_andamento'?'Em andamento • Início: '+when(e.iniciado_em):e.estado==='suspensa'?'Suspensa em '+when(e.suspenso_em)+' • Início: '+when(e.iniciado_em):'Concluída em '+when(e.concluido_em));card.append(p);}
  if(t.resposta){const r=document.createElement('div');r.className='response';r.textContent=t.resposta.responsavel+' • '+t.resposta.tipo.toUpperCase()+'\n'+(t.resposta.conteudo||'Sem observação adicional.');const time=document.createElement('p');time.className='muted';time.textContent=new Date(t.resposta.criado_em).toLocaleString('pt-BR',{timeZone:'America/Recife'});card.append(r,time);}supervisorTasks.append(card);
 });
}
async function supervisorLoad(){
 const sequence=++supervisorRequest;supervisorData=null;supervisorTasks.replaceChildren();supervisorStatus.textContent='Atualizando demandas autorizadas...';document.getElementById('refresh').disabled=true;
 if(!supervisorToken){supervisorStatus.textContent='Abra o link de supervisão recebido no WhatsApp.';document.getElementById('refresh').disabled=false;return;}
 try{const r=await fetch(supervisorApi,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'demands',token:supervisorToken}),cache:'no-store',signal:AbortSignal.timeout(30000)});const d=await r.json();if(sequence!==supervisorRequest)return;if(!r.ok)throw Error(d.erro||'Não foi possível consultar as demandas');supervisorData=d;document.getElementById('identity').textContent='Supervisor: '+d.supervisor;supervisorOptions('filterPerson',d.pessoas,'Todos os supervisionados');supervisorOptions('filterGroup',d.grupos,'Todos os grupos autorizados');supervisorStatus.textContent='Atualizado: '+new Date(d.atualizado_em).toLocaleString('pt-BR',{timeZone:'America/Recife'})+' • '+d.tarefas.length+' demanda(s) autorizada(s).';supervisorRender();}catch(e){if(sequence!==supervisorRequest)return;supervisorData=null;supervisorTasks.replaceChildren();supervisorOptions('filterPerson',[],'Todos os supervisionados');supervisorOptions('filterGroup',[],'Todos os grupos autorizados');supervisorStatus.textContent=e.message;document.getElementById('identity').textContent='Demandas dos supervisionados';}finally{if(sequence===supervisorRequest)document.getElementById('refresh').disabled=false;}
}
['filterPerson','filterGroup','filterStatus'].forEach(id=>document.getElementById(id).addEventListener('change',supervisorRender));
document.getElementById('refresh').addEventListener('click',supervisorLoad);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)supervisorLoad()});
window.addEventListener('online',supervisorLoad);
setInterval(()=>{if(!document.hidden)supervisorLoad()},30000);
supervisorLoad();
