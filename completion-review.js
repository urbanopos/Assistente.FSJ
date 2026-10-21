/* FSJ_OWNER_COMPLETION_REVIEW_V1 */
(()=>{
 const form=document.getElementById('novaTarefa');if(!form)return;
 const panel=document.createElement('section');panel.id='ownerCompletionReview';panel.hidden=true;panel.className='card';
 panel.innerHTML='<h3>Revisar conclusão</h3><p id="completionReviewStatus" class="muted" role="status" aria-live="polite"></p><div id="completionReviewControls" hidden><label for="completionReviewChoice">Conclusão a cancelar</label><select id="completionReviewChoice"></select><label for="completionReviewReason">Motivo · serviço não realizado satisfatoriamente</label><textarea id="completionReviewReason" maxlength="1000" rows="2" placeholder="Descreva o que precisa ser corrigido"></textarea><button id="cancelCompletionBtn" type="button" class="danger">Cancelar conclusão</button></div><details id="completionReviewHistory" hidden><summary>Revisões anteriores</summary><div id="completionReviewHistoryRows"></div></details>';
 document.getElementById('taskDraftStatus').before(panel);
 const get=id=>document.getElementById(id),status=get('completionReviewStatus'),controls=get('completionReviewControls'),choice=get('completionReviewChoice'),reason=get('completionReviewReason'),button=get('cancelCompletionBtn');
 let sequence=0,taskId='',requestId=null,working=false;
 const errorText=e=>{try{return JSON.parse(e.message).erro||e.message}catch{return e.message}};
 const dayLabel=d=>d?d.split('-').reverse().join('/'):'Conclusão da demanda';
 async function show(id){
  const serial=++sequence;taskId=id;requestId=null;reason.value='';controls.hidden=true;panel.hidden=!id;
  get('completionReviewHistory').hidden=true;if(!id)return;
  status.textContent='Consultando conclusões…';
  try{
   const info=await api('/functions/v1/supervisao',{method:'POST',body:JSON.stringify({action:'completion-info',tarefa_id:id})});
   if(serial!==sequence||get('taskEditId').value!==id)return;
   choice.replaceChildren();
   for(const c of info.conclusoes||[])choice.add(new Option((info.diaria?'Dia '+dayLabel(c.dia):'Conclusão da demanda')+(c.registrada_em?' · '+new Date(c.registrada_em).toLocaleString('pt-BR',{timeZone:'America/Recife'}):''),c.id||'manual'));
   controls.hidden=info.situacao==='Arquivado'||!choice.options.length;
   status.textContent=info.situacao==='Arquivado'?'Demanda arquivada: revisão indisponível nesta edição.':choice.options.length?'A conclusão anterior ficará no histórico. A tarefa voltará a pendente para correção e nova resposta.':'Não há conclusão válida para cancelar.';
   const rows=get('completionReviewHistoryRows');rows.replaceChildren();
   for(const r of info.revisoes||[]){const p=document.createElement('p');p.className='muted';p.textContent=(r.dia?'Dia '+dayLabel(r.dia)+' · ':'')+new Date(r.em).toLocaleString('pt-BR',{timeZone:'America/Recife'})+' — '+r.motivo;rows.append(p);}
   get('completionReviewHistory').hidden=!rows.childElementCount;
  }catch(e){if(serial===sequence)status.textContent='Não foi possível consultar: '+errorText(e);}
 }
 choice.onchange=reason.oninput=()=>{requestId=null;};
 button.onclick=async()=>{
  if(working||!taskId||get('taskEditId').value!==taskId)return;
  const motive=reason.value.trim();if(!motive){status.textContent='Informe o motivo do cancelamento.';reason.focus();return;}
  const task=S.tasks.find(t=>t.id===taskId),selection=choice.options[choice.selectedIndex];if(!selection)return;
  if(!confirm('Cancelar a conclusão de '+(task?.code||'esta demanda')+'?\n'+selection.text+'\nMotivo: '+motive+'\nA tarefa voltará a pendente. O histórico será preservado.'))return;
  working=true;button.disabled=true;choice.disabled=reason.disabled=true;status.textContent='Registrando revisão…';requestId=requestId||crypto.randomUUID();
  try{
   const id=taskId;await api('/functions/v1/supervisao',{method:'POST',body:JSON.stringify({action:'reopen-completion',tarefa_id:id,motivo:motive,requisicao:requestId,conclusao_id:choice.value==='manual'?null:choice.value})});
   await fsjAtualizarRetornos(true);save();
   if(taskId===id&&get('taskEditId').value===id){await show(id);status.textContent='Conclusão cancelada. A tarefa está pendente para correção e nova resposta.';}
  }catch(e){status.textContent='Não foi possível concluir: '+errorText(e);}
  finally{working=false;button.disabled=false;choice.disabled=reason.disabled=false;}
 };
 const previousEdit=window.editTask;window.editTask=function(id){previousEdit(id);show(id);};
 const previousClear=window.clearTaskForm;window.clearTaskForm=function(){previousClear();show('');};
 if(get('taskEditId').value)show(get('taskEditId').value);
})();

