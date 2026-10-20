/* FSJ_TASK_SUGGESTIONS_V1 */
(()=>{
 'use strict';
 const manager=!!document.getElementById('dashboard'),el=id=>document.getElementById(id);
 const participant=!manager&&location.pathname.endsWith('/responder.html')&&typeof responseParams!=='undefined'&&responseParams.get('gestor')!=='1';
 const endpoint='https://awrxnzbfrsaurzpunuko.supabase.co/functions/v1/sugestoes-tarefas';
 const dialog=document.createElement('dialog');dialog.id='fsjSuggestionDialog';dialog.style.cssText='box-sizing:border-box;width:min(620px,100vw);max-height:100dvh;border:0;border-radius:12px;padding:0;background:#f4f6ed;color:#213d2d;font:16px system-ui';
 dialog.innerHTML='<header style="display:flex;align-items:center;gap:10px;background:#174b3b;color:white;padding:10px 16px"><img src="./icon-512.png" width="36" height="36" alt=""><strong>Fazenda São José</strong></header><section style="padding:14px 18px"><h2 id="fsjSuggestionHeading"></h2><p id="fsjSuggestionIdentity"></p><label for="fsjSuggestionChoice">Sugestões registradas</label><select id="fsjSuggestionChoice" style="width:100%;font:inherit;padding:8px"><option value="">Nova sugestão</option></select><label for="fsjSuggestionText" style="display:block;margin-top:10px">Descreva sua sugestão</label><textarea id="fsjSuggestionText" maxlength="2000" rows="3" style="box-sizing:border-box;width:100%;font:inherit;padding:10px;border:1px solid #bccfc0;border-radius:8px"></textarea><button type="button" id="fsjSuggestionVoice">🎙 Capturar voz</button><button type="button" id="fsjSuggestionSend">Enviar sugestão</button><p id="fsjSuggestionState" role="status"></p><div id="fsjSuggestionReview" hidden><label for="fsjSuggestionNotes">Justificativa / observações do gestor</label><textarea id="fsjSuggestionNotes" rows="3" maxlength="2000" style="box-sizing:border-box;width:100%;font:inherit;padding:10px;border:1px solid #bccfc0;border-radius:8px"></textarea><div id="fsjSuggestionDecision"><label><input type="radio" name="fsjSuggestionDecision" value="aprovada"> APROVAR</label> <label><input type="radio" name="fsjSuggestionDecision" value="rejeitada"> REJEITAR</label><button type="button" id="fsjSuggestionSave">Enviar decisão</button></div></div><p id="fsjSuggestionFeedback" role="status" aria-live="polite"></p><button type="button" id="fsjSuggestionBack" aria-label="Voltar">←</button></section>';
 
 // Categorias opcionais, sem alterar o contrato da API nem o fluxo de aprovação.
 const category=document.createElement('div');category.id='fsjSuggestionCategories';
 category.innerHTML='<p style="margin:10px 0 5px"><strong>Categoria (opcional)</strong></p><div style="display:flex;flex-wrap:wrap;gap:5px"></div>';
 for(const name of ['Manutenção','Limpeza','Plantio','Irrigação','Animais','Infraestrutura','Outros']){
  const b=document.createElement('button');b.type='button';b.textContent=name;b.className='fsj-category';b.style.cssText='background:#eaf4e9;color:#213d2d;border:1px solid #bed5c2;font-size:14px;padding:7px 10px';
  b.onclick=()=>{for(const x of category.querySelectorAll('button')){x.dataset.active='';x.style.background='#eaf4e9'}b.dataset.active='1';b.style.background='#b6dfc3';};
  category.querySelector('div').append(b);
 }
 dialog.querySelector('#fsjSuggestionVoice').before(category);
 document.body.append(dialog);
 if(participant){
  dialog.classList.add('fsj-participant-request');
  const css=document.createElement('style');
  css.textContent=`
  #fsjTaskQuestions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
  #fsjTaskQuestions button{margin:0;min-width:0;background:#235d41;color:white;border:0;border-radius:9px;padding:10px 8px;font:600 14px system-ui}
  dialog.fsj-participant-request{width:min(620px,100vw)!important;height:100dvh;max-height:100dvh!important;margin:0 auto;padding:0!important;border-radius:0!important}
  dialog.fsj-participant-request[open]{display:flex;flex-direction:column}
  dialog.fsj-participant-request>header{flex:none}
  dialog.fsj-participant-request>section{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px}
  dialog.fsj-participant-request h2{font-size:20px;margin:4px 0}
  dialog.fsj-participant-request p{margin:4px 0}
  dialog.fsj-participant-request textarea{resize:vertical;min-height:80px}
  dialog.fsj-participant-request button{background:#235d41;color:#fff;border:0;border-radius:9px;padding:9px;font:inherit}
  dialog.fsj-participant-request [hidden]{display:none!important}
  .fsj-request-navigation{display:grid;grid-template-columns:54px 1fr 54px;align-items:center;gap:8px;margin-top:auto;padding-top:8px;flex:none;text-align:center}
  .fsj-request-navigation button{width:54px!important;min-width:54px;height:44px!important;padding:0!important;font:700 30px/44px Arial!important}
  .fsj-request-navigation button:disabled{opacity:.35}
  `;document.head.append(css);
  const nav=document.createElement('nav');nav.className='fsj-request-navigation';nav.setAttribute('aria-label','Navegação do formulário');
  const back=el('fsjSuggestionBack');back.setAttribute('aria-label','Retornar à tarefa');
  const count=document.createElement('span');count.textContent='1 / 1';
  const next=document.createElement('button');next.type='button';next.textContent='→';next.disabled=true;next.setAttribute('aria-label','Próximo');
  nav.append(back,count,next);dialog.querySelector('section').append(nav);
 }
 let rows=[],selected='',requestId=null,working=false,recognition=null,kind='sugestao';
 const labels={aguardando:'Aguardando análise do gestor',aprovada:'APROVADA',rejeitada:'REJEITADA'};
 async function call(data){
  if(manager)return api('/functions/v1/sugestoes-tarefas',{method:'POST',body:JSON.stringify(data)});
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,token})});const result=await response.json();if(!response.ok)throw Error(result.erro||'Não foi possível registrar.');return result;
 }
 function feedback(text){el('fsjSuggestionFeedback').textContent=text;}
 function show(){
  const item=rows.find(s=>s.id===selected),locked=!!item;
  category.hidden=manager||locked||kind==='duvida';
  el('fsjSuggestionText').readOnly=manager||locked;
  el('fsjSuggestionText').value=item?.descricao||'';
  el('fsjSuggestionVoice').hidden=manager||locked;el('fsjSuggestionSend').hidden=manager||locked;
  el('fsjSuggestionReview').hidden=!item;
  el('fsjSuggestionNotes').readOnly=!manager||item?.estado!=='aguardando';
  el('fsjSuggestionNotes').value=item?.observacoes||'';
  el('fsjSuggestionDecision').hidden=!manager||!item||item.estado!=='aguardando';
  document.querySelectorAll('[name=fsjSuggestionDecision]').forEach(x=>x.checked=x.value===item?.estado);
  const question=(item?.tipo||kind)==='duvida';
  el('fsjSuggestionHeading').textContent=manager?'Análise do gestor':question?'Dúvidas sobre a tarefa':'Sugestão de Tarefa';
  el('fsjSuggestionText').previousElementSibling.textContent=question?'Descreva sua dúvida':'Descreva sua sugestão';
  el('fsjSuggestionSave').textContent=question?'Enviar resposta':'Enviar decisão';
  el('fsjSuggestionSend').textContent=question?'Enviar dúvida':'Enviar sugestão';
  el('fsjSuggestionDecision').querySelectorAll('label').forEach(label=>label.hidden=question);
  el('fsjSuggestionState').textContent=item?(question&&item.estado==='aprovada'?'RESPONDIDA':labels[item.estado]):(manager?'Selecione uma sugestão.':'O envio cria uma tarefa urgente para o gestor.');
  el('fsjSuggestionState').style.color=item?.estado==='aprovada'?'#14532d':item?.estado==='rejeitada'?'#b91c1c':'#735900';
  el('fsjSuggestionIdentity').textContent=manager&&item?'URGENTE · Solicitante: '+(typeof person==='function'?(person(item.pessoa_id).nick||person(item.pessoa_id).name||item.pessoa_id):item.pessoa_id):!manager&&typeof info!=='undefined'&&info?'Participante: '+info.responsavel:'';
 }
 async function refresh(){
  const data=await call({action:manager?'gestor_listar':'listar'});rows=data.sugestoes.filter(s=>manager||s.tipo===kind);
  const pick=el('fsjSuggestionChoice');pick.replaceChildren(new Option(manager?'Selecione…':'Nova sugestão',''),...rows.map(s=>new Option((labels[s.estado]||s.estado)+' — '+s.descricao.slice(0,65),s.id)));pick.value=selected;
  if(selected&&rows.some(s=>s.id===selected))show();
 }
 async function open(taskId){
  if(!manager&&(typeof info==='undefined'||!info)){return;}
  el('fsjSuggestionHeading').textContent=manager?'Análise de sugestões':'Sugestão de tarefas';
  show();dialog.showModal();feedback('Consultando registros…');
  try{await refresh();if(taskId)selected=rows.find(s=>s.tarefa_gestor_id===taskId)?.id||'';el('fsjSuggestionChoice').value=selected;show();feedback('');}catch(e){feedback(e.message);}
 }
 el('fsjSuggestionChoice').onchange=()=>{selected=el('fsjSuggestionChoice').value;requestId=null;show();feedback('');};
 el('fsjSuggestionBack').onclick=()=>{recognition?.stop();dialog.close();};
 el('fsjSuggestionVoice').onclick=()=>{
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R)return feedback('Captura de voz indisponível neste navegador. Use o microfone do teclado ou digite.');
  recognition=new R();recognition.lang='pt-BR';recognition.onresult=e=>{el('fsjSuggestionText').value=(el('fsjSuggestionText').value+' '+e.results[0][0].transcript).trim().slice(0,2000);feedback('Texto preenchido. Confira antes de enviar.');};recognition.onerror=()=>feedback('Não foi possível capturar voz. Você pode digitar.');recognition.onend=()=>{el('fsjSuggestionVoice').disabled=false;};el('fsjSuggestionVoice').disabled=true;try{recognition.start();feedback('Ouvindo…');}catch{el('fsjSuggestionVoice').disabled=false;feedback('Microfone indisponível.');}
 };
 el('fsjSuggestionSend').onclick=async()=>{
  if(working||selected)return;const texto=el('fsjSuggestionText').value.trim();const categoria=category.querySelector('button[data-active="1"]')?.textContent;const descricao=categoria&&kind==='sugestao'?'['+categoria+'] '+texto:texto;if(!texto)return feedback('Descreva sua sugestão antes de enviar.');
  requestId ||= crypto.randomUUID();working=true;el('fsjSuggestionSend').disabled=true;
  try{const data=await call({action:kind==='duvida'?'enviar_duvida':'enviar',descricao,requisicao:requestId});selected=data.sugestao.id;await refresh();el('fsjSuggestionChoice').value=selected;show();feedback('Registro enviado. Foi criada uma tarefa urgente para o gestor.');requestId=null;}catch(e){feedback(e.message+' Sua descrição foi preservada.');}finally{working=false;el('fsjSuggestionSend').disabled=false;}
 };
 el('fsjSuggestionSave').onclick=async()=>{
  if(working||!selected)return;const estado=rows.find(s=>s.id===selected)?.tipo==='duvida'?'aprovada':document.querySelector('[name=fsjSuggestionDecision]:checked')?.value,observacoes=el('fsjSuggestionNotes').value.trim();if(!estado||!observacoes)return feedback('Escolha aprovar ou rejeitar e preencha a justificativa.');
  working=true;el('fsjSuggestionSave').disabled=true;
  try{await call({action:'decidir',id:selected,estado,observacoes});await refresh();show();feedback('Decisão registrada e disponível no formulário do participante.');}catch(e){feedback(e.message);}finally{working=false;el('fsjSuggestionSave').disabled=false;}
 };
 if(manager){
  const button=document.createElement('button');button.type='button';button.textContent='Analisar sugestões de tarefas';button.onclick=()=>open();el('dashboard').prepend(button);
  const load=fsjLoadTaskDetails;
  fsjLoadTaskDetails=async function(id){const details=await load(id);if(String(id).startsWith('sugestao-'))details.sections.unshift({title:'Sugestão de tarefa',entries:[{text:'Analise a sugestão, aprove ou rejeite e justifique a decisão.',actions:[{label:'Analisar sugestão',run:()=>open(id)}]}]});return details;};
 }else if(participant){
  const button=document.createElement('button');button.type='button';button.textContent='Sugestão de tarefas';button.onclick=()=>{kind='sugestao';selected='';requestId=null;open();};button.style.cssText='display:block;margin:10px auto';el('taskAnswer').after(button);
  const doubt=document.createElement('button');doubt.type='button';doubt.textContent='Dúvidas sobre a tarefa';
  doubt.onclick=()=>{kind='duvida';selected='';requestId=null;open();};button.before(doubt);doubt.style.cssText='display:block;margin:10px auto';
  button.textContent='Sugestão de Tarefa';
  const actions=document.createElement('div');actions.id='fsjTaskQuestions';actions.append(doubt,button);
  el('startTask').after(actions);
 }else{
  const button=document.createElement('button');button.type='button';button.textContent='Sugestão de tarefas';button.onclick=()=>{kind='sugestao';selected='';requestId=null;open();};button.style.cssText='display:block;margin:10px auto';el('taskAnswer').after(button);
  const doubt=document.createElement('button');doubt.type='button';doubt.textContent='Dúvidas sobre a tarefa';
  doubt.onclick=()=>{kind='duvida';selected='';requestId=null;open();};button.before(doubt);doubt.style.cssText='display:block;margin:10px auto';
  const footer=document.querySelector('main .fsj-page-navigation');if(footer&&matchMedia('(max-width:700px)').matches){footer.append(button,doubt);button.style.cssText='';doubt.style.cssText='';button.classList.add('fsj-footer-action','fsj-suggestion-action');doubt.classList.add('fsj-footer-action','fsj-doubt-action');}
 }
 setInterval(()=>{if(dialog.open&&selected&&!working&&(!manager||rows.find(s=>s.id===selected)?.estado!=='aguardando'))refresh().catch(()=>{});},15000);
})();
