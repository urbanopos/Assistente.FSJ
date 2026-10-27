/* FSJ_TASK_SUGGESTIONS_V1 */
(()=>{
 'use strict';
 const manager=!!document.getElementById('dashboard'),el=id=>document.getElementById(id);
 const participant=!manager&&location.pathname.endsWith('/responder.html')&&typeof responseParams!=='undefined'&&responseParams.get('gestor')!=='1';
 // Sem identificador válido não existe formulário de tarefa nem controles de ação.
 if(participant&&!responseParams.get('token'))return;
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
  const sourceHeader=document.querySelector('body>header');
  if(sourceHeader){const header=sourceHeader.cloneNode(true);header.querySelectorAll('[data-fsj-screen-back]').forEach(x=>x.remove());header.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));dialog.querySelector('header').replaceWith(header);}
  const taskCode=document.createElement('p');taskCode.id='fsjSuggestionTaskCode';taskCode.hidden=true;el('fsjSuggestionChoice').after(taskCode);
  const label=dialog.querySelector('label[for="fsjSuggestionText"]');label.before(category);
  const actions=document.createElement('div');actions.className='fsj-suggestion-actions';el('fsjSuggestionVoice').before(actions);actions.append(el('fsjSuggestionVoice'),el('fsjSuggestionSend'));
  const counter=document.createElement('small');counter.id='fsjSuggestionCounter';counter.setAttribute('aria-live','polite');el('fsjSuggestionText').after(counter);
  const css=document.createElement('style');
  css.textContent=`
  #fsjTaskQuestions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
  #fsjTaskQuestions button{margin:0;min-width:0;background:#235d41;color:white;border:0;border-radius:9px;padding:10px 8px;font:600 14px system-ui}
  dialog.fsj-participant-request{width:min(620px,100vw)!important;height:100dvh;max-height:100dvh!important;margin:0 auto;padding:0!important;border-radius:0!important}
  dialog.fsj-participant-request[open]{display:flex;flex-direction:column}
  #fsjSuggestionDialog.fsj-participant-request>header{display:block!important;flex:none;background:#e4f1e6!important;color:#213d2d!important;border-top:8px solid #174b3b;padding:12px!important}
  #fsjSuggestionDialog.fsj-participant-request>header .response-brand{display:flex;align-items:center;gap:10px;font-size:20px}
  #fsjSuggestionDialog.fsj-participant-request>header img{width:48px;height:48px;object-fit:contain}
  #fsjSuggestionDialog.fsj-participant-request>header>div{font-size:13px;margin-top:6px}
  #fsjSuggestionTaskCode{background:#e4f1e6;border-radius:8px;padding:11px;font-weight:600}
  #fsjSuggestionDialog.fsj-participant-request{max-height:100dvh!important;width:min(620px,100vw)!important}
  #fsjSuggestionDialog.fsj-participant-request .fsj-request-navigation button{margin:0!important;flex:none}
  
  dialog.fsj-participant-request>section{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px}
  dialog.fsj-participant-request h2{font-size:20px;margin:4px 0}
  dialog.fsj-participant-request p{margin:4px 0}
  dialog.fsj-participant-request textarea{resize:none;min-height:90px;height:clamp(90px,22dvh,160px)}
  #fsjSuggestionDialog.fsj-participant-request #fsjSuggestionCategories{margin:0!important}
  #fsjSuggestionDialog.fsj-participant-request #fsjSuggestionCategories>p{display:none}
  #fsjSuggestionDialog.fsj-participant-request #fsjSuggestionCategories button{margin:0!important;min-height:36px!important;padding:7px 9px!important}
  #fsjSuggestionDialog.fsj-participant-request .fsj-suggestion-actions{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
  #fsjSuggestionDialog.fsj-participant-request .fsj-suggestion-actions button{min-width:0;margin:0!important;min-height:44px}
  #fsjSuggestionCounter{text-align:right;color:#526957;font-size:12px}
  #fsjSuggestionDialog.fsj-participant-request #fsjSuggestionState:empty,
  #fsjSuggestionDialog.fsj-participant-request #fsjSuggestionFeedback:empty{display:none}
  
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
if(manager){
 const tabs=document.createElement('div');tabs.id='fsjManagerRequestTabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Tipo de solicitação');
 for(const [value,label] of [['todas','Todas'],['duvida','Dúvidas'],['sugestao','Sugestões']]){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.kind=value;
  b.onclick=()=>{tabs.dataset.filter=value;selected='';refresh().then(()=>{show();feedback('');}).catch(e=>feedback(e.message));};
  tabs.append(b);
 }
 tabs.dataset.filter='todas';el('fsjSuggestionChoice').before(tabs);
 const nav=document.createElement('nav');nav.className='fsj-manager-response-nav';nav.setAttribute('aria-label','Navegação de solicitações');
 const prev=document.createElement('button');prev.type='button';prev.textContent='←';
 const count=document.createElement('span');count.id='fsjManagerResponseCount';count.textContent='0 / 0';
 const next=document.createElement('button');next.type='button';next.textContent='→';
 const step=delta=>{const index=rows.findIndex(x=>x.id===selected);const target=rows[Math.max(0,Math.min(rows.length-1,(index<0?0:index)+delta))];if(!target)return;selected=target.id;el('fsjSuggestionChoice').value=selected;show();};
 prev.onclick=()=>step(-1);next.onclick=()=>step(1);
 nav.append(prev,count,next);dialog.querySelector('section').append(nav);
 const style=document.createElement('style');style.textContent=`
 #fsjSuggestionDialog{width:min(620px,100vw)!important;max-height:100dvh!important}
 #fsjSuggestionDialog>section{overflow-y:auto;max-height:calc(100dvh - 58px);display:flex;flex-direction:column;gap:8px}
 #fsjSuggestionDialog h2{font-size:20px;margin:3px 0}
 #fsjSuggestionDialog p{margin:4px 0}
 #fsjManagerRequestTabs{display:flex;gap:7px}
 #fsjManagerRequestTabs button{flex:1;min-width:0;background:#e5efe7;color:#17523d;border:1px solid #9abda7;border-radius:8px;padding:9px 4px;font:600 13px system-ui}
 #fsjManagerRequestTabs[data-filter="todas"] [data-kind="todas"],#fsjManagerRequestTabs[data-filter="duvida"] [data-kind="duvida"],#fsjManagerRequestTabs[data-filter="sugestao"] [data-kind="sugestao"]{background:#17523d;color:white}
 #fsjSuggestionReview{background:#fff5dd;border-radius:9px;padding:10px}
 #fsjSuggestionNotes{min-height:80px}
 #fsjSuggestionDialog button{cursor:pointer}
 #fsjSuggestionSave{background:#175b40;color:#fff;border:0;border-radius:8px;padding:10px 14px;font-weight:700}
 #fsjManagerAnswerMic{background:#d8e7ff;color:#1757a2;border:0;border-radius:8px;padding:9px}
 .fsj-manager-response-nav{display:grid;grid-template-columns:50px 1fr 50px;align-items:center;gap:8px;text-align:center;margin-top:auto;padding-top:8px} .fsj-manager-response-nav button{background:#175b40;color:white;border:0;border-radius:8px;min-height:42px;font-size:23px} #fsjSuggestionBack{align-self:flex-start;background:#175b40;color:white;border:0;border-radius:8px;padding:7px 18px;font-size:23px}
 @media(max-width:700px){#fsjSuggestionDialog{height:100dvh!important;border-radius:0!important}#fsjSuggestionDialog>section{padding:10px!important}}
 `;document.head.append(style);
}

 const labels={aguardando:'Aguardando análise do gestor',aprovada:'APROVADA',rejeitada:'REJEITADA'};
 async function call(data){
  if(manager)return api('/functions/v1/sugestoes-tarefas',{method:'POST',body:JSON.stringify(data)});
  const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,token})});const result=await response.json();if(!response.ok)throw Error(result.erro||'Não foi possível registrar.');return result;
 }
 const suggestionCode=item=>item?.numero?'Sug - '+String(item.numero).padStart(6,'0'):'Sug - (número ao enviar)';
 function updateCounter(){if(!participant)return;const field=el('fsjSuggestionText');el('fsjSuggestionCounter').textContent=field.value.length+' / '+field.maxLength+' caracteres';}
 el('fsjSuggestionText').addEventListener('input',updateCounter);
 function feedback(text){el('fsjSuggestionFeedback').textContent=text;}
 function show(){
  const item=rows.find(s=>s.id===selected),locked=!!item;if(manager&&el('fsjManagerResponseCount'))el('fsjManagerResponseCount').textContent=(selected?Math.max(1,rows.findIndex(x=>x.id===selected)+1):0)+' / '+rows.length;
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
  if(participant){
   el('fsjSuggestionChoice').hidden=question;
   dialog.querySelector('label[for="fsjSuggestionChoice"]').hidden=question;
   const code=el('fsjSuggestionTaskCode');code.hidden=false;
   code.textContent=question?(typeof info!=='undefined'&&info?.codigo_tarefa?fsjResponseTaskNumber(info.codigo_tarefa,info.periodicidade):'Tarefa sem número'):suggestionCode(item);
   el('fsjSuggestionText').maxLength=question||locked?2000:500;
   updateCounter();
  }
  el('fsjSuggestionHeading').textContent=manager?(question?'Resposta à dúvida':'Análise de sugestão'):question?'Dúvidas sobre a tarefa':'Sugestão de Tarefa';
  dialog.querySelector('label[for="fsjSuggestionText"]').textContent=question?'Descreva sua dúvida':'Descreva sua sugestão';
  el('fsjSuggestionSave').textContent=question?'Enviar resposta':'Enviar decisão';if(manager){const mic=el('fsjManagerAnswerMic');if(mic)mic.hidden=!item||item.estado!=='aguardando';}
  el('fsjSuggestionSend').textContent=question?'Enviar dúvida':'Enviar sugestão';
  el('fsjSuggestionDecision').querySelectorAll('label').forEach(label=>label.hidden=question);
  el('fsjSuggestionState').textContent=item?(question&&item.estado==='aprovada'?'RESPONDIDA':labels[item.estado]):(manager?'Selecione uma sugestão.':question?'A dúvida será encaminhada ao proprietário e ficará disponível aos supervisores responsáveis.':'O envio cria uma tarefa urgente para o gestor.');
  el('fsjSuggestionState').style.color=item?.estado==='aprovada'?'#14532d':item?.estado==='rejeitada'?'#b91c1c':'#735900';
  el('fsjSuggestionIdentity').textContent=manager&&item?'URGENTE · Solicitante: '+(typeof person==='function'?(person(item.pessoa_id).nick||person(item.pessoa_id).name||item.pessoa_id):item.pessoa_id):!manager&&typeof info!=='undefined'&&info?'Participante: '+info.responsavel:'';
 }
 async function refresh(){
  const data=await call({action:manager?'gestor_listar':'listar'});rows=data.sugestoes.filter(s=>manager?(el('fsjManagerRequestTabs')?.dataset.filter==='todas'||s.tipo===el('fsjManagerRequestTabs')?.dataset.filter):s.tipo===kind);
  const pick=el('fsjSuggestionChoice');pick.replaceChildren(new Option(manager?'Selecione…':'Nova sugestão',''),...rows.map(s=>new Option(participant&&kind==='sugestao'?suggestionCode(s):(labels[s.estado]||s.estado)+' — '+s.descricao.slice(0,65),s.id)));pick.value=selected;
  if(selected&&rows.some(s=>s.id===selected))show();
 }
 async function open(taskId){
  if(!manager&&(typeof info==='undefined'||!info)){return;}
  el('fsjSuggestionHeading').textContent=manager?'Análise de sugestões':'Sugestão de tarefas';
  show();dialog.showModal();feedback('Consultando registros…');
  try{await refresh();if(taskId)selected=rows.find(s=>s.tarefa_gestor_id===taskId)?.id||'';el('fsjSuggestionChoice').value=selected;if(selected)show();feedback('');}catch(e){feedback(e.message);}
 }
 el('fsjSuggestionChoice').onchange=()=>{selected=el('fsjSuggestionChoice').value;requestId=null;show();feedback('');};
 el('fsjSuggestionBack').onclick=()=>{recognition?.stop();dialog.close();};
 el('fsjSuggestionVoice').onclick=()=>{
  const R=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!R)return feedback('Captura de voz indisponível neste navegador. Use o microfone do teclado ou digite.');
  recognition=new R();recognition.lang='pt-BR';recognition.onresult=e=>{el('fsjSuggestionText').value=(el('fsjSuggestionText').value+' '+e.results[0][0].transcript).trim().slice(0,el('fsjSuggestionText').maxLength);updateCounter();feedback('Texto preenchido. Confira antes de enviar.');};recognition.onerror=()=>feedback('Não foi possível capturar voz. Você pode digitar.');recognition.onend=()=>{el('fsjSuggestionVoice').disabled=false;};el('fsjSuggestionVoice').disabled=true;try{recognition.start();feedback('Ouvindo…');}catch{el('fsjSuggestionVoice').disabled=false;feedback('Microfone indisponível.');}
 };
 el('fsjSuggestionSend').onclick=async()=>{
  if(working||selected)return;const texto=el('fsjSuggestionText').value.trim();const categoria=category.querySelector('button[data-active="1"]')?.textContent;const descricao=categoria&&kind==='sugestao'?'['+categoria+'] '+texto:texto;if(!texto)return feedback(kind==='duvida'?'Descreva sua dúvida antes de enviar.':'Descreva sua sugestão antes de enviar.');
  if(participant&&kind==='sugestao'&&texto.length>500)return feedback('Limite de 500 caracteres para a descrição.');
  requestId ||= crypto.randomUUID();working=true;el('fsjSuggestionSend').disabled=true;
  try{const data=await call({action:kind==='duvida'?'enviar_duvida':'enviar',descricao,requisicao:requestId});selected=data.sugestao.id;rows=[data.sugestao,...rows.filter(x=>x.id!==selected)];show();await refresh();el('fsjSuggestionChoice').value=selected;show();feedback(kind==='duvida'?'Dúvida encaminhada ao proprietário e disponível aos supervisores responsáveis.':'Registro enviado. Foi criada uma tarefa urgente para o gestor.');requestId=null;}catch(e){feedback(e.message+' Sua descrição foi preservada.');}finally{working=false;el('fsjSuggestionSend').disabled=false;}
 };
 el('fsjSuggestionSave').onclick=async()=>{
  if(working||!selected)return;const estado=rows.find(s=>s.id===selected)?.tipo==='duvida'?'aprovada':document.querySelector('[name=fsjSuggestionDecision]:checked')?.value,observacoes=el('fsjSuggestionNotes').value.trim();if(!estado||!observacoes)return feedback(rows.find(s=>s.id===selected)?.tipo==='duvida'?'Preencha a resposta à dúvida.':'Escolha aprovar ou rejeitar e preencha a orientação.');
  working=true;el('fsjSuggestionSave').disabled=true;
  try{await call(rows.find(s=>s.id===selected)?.tipo==='duvida'?{action:'responder_duvida',id:selected,resposta:observacoes}:{action:'decidir',id:selected,estado,observacoes});await refresh();show();feedback('Decisão registrada e disponível no formulário do participante.');}catch(e){feedback(e.message);}finally{working=false;el('fsjSuggestionSave').disabled=false;}
 };
 if(manager){
  const mic=document.createElement('button');
  mic.type='button';mic.id='fsjManagerAnswerMic';mic.textContent='🎙 Captar voz';mic.hidden=true;
  el('fsjSuggestionNotes').after(mic);
  mic.onclick=()=>{
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!R){feedback('Ditado indisponível. Digite a resposta.');return;}
    const rec=new R();rec.lang='pt-BR';
    rec.onresult=e=>{const field=el('fsjSuggestionNotes');field.value=(field.value+' '+e.results[0][0].transcript).trim().slice(0,2000);feedback('Confira o texto antes de enviar.');};
    rec.onerror=()=>feedback('Não foi possível captar a voz.');
    mic.disabled=true;rec.onend=()=>{mic.disabled=false;};
    try{rec.start();}catch{mic.disabled=false;}
  };
  const button=document.createElement('button');button.type='button';button.textContent='Analisar sugestões de tarefas';button.onclick=()=>open();el('dashboard').prepend(button);
  const load=fsjLoadTaskDetails;
  fsjLoadTaskDetails=async function(id){const details=await load(id);if(String(id).startsWith('sugestao-'))details.sections.unshift({title:'Sugestão de tarefa',entries:[{text:'Analise a sugestão, aprove ou rejeite e justifique a decisão.',actions:[{label:'Analisar sugestão',run:()=>open(id)}]}]});return details;};
 }else{
  // Na resposta individual, os dois controles ficam ao lado de Iniciar tarefa.
  // Nunca transferi-los ao rodapé móvel ou recriá-los em outro contêiner.
  const actions=document.createElement('div');actions.id='fsjTaskQuestions';
  const doubt=document.createElement('button');doubt.type='button';doubt.textContent='Dúvidas sobre a tarefa';
  doubt.onclick=()=>{kind='duvida';selected='';requestId=null;open();};
  const suggestion=document.createElement('button');suggestion.type='button';suggestion.textContent='Sugestão de tarefas';
  suggestion.onclick=()=>{kind='sugestao';selected='';requestId=null;open();};
  actions.append(doubt,suggestion);
  const target=el('taskAnswer')?.closest('.fsj-execution-actions');
  if(target)target.append(actions);
  else el('startTask').after(actions);
 }
 setInterval(()=>{if(dialog.open&&selected&&!working&&(!manager||rows.find(s=>s.id===selected)?.estado!=='aguardando'))refresh().catch(()=>{});},15000);
})();
