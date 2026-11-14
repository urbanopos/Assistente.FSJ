/* Mobile pages use CSS fragmentation: long text continues on the next page.
   Original controls stay mounted, preserving values, files and event handlers. */
(()=>{
 'use strict';
 const mobile=matchMedia('(max-width:700px)'),states=new Map();
 let frame=0;
 const element=(tag,className)=>{const el=document.createElement(tag);el.className=className;return el;};
 function organizarInicioProprietario(root){
  if(root.id!=='dashboard'||!mobile.matches||!document.getElementById('gestor'))return;
  if(root.dataset.fsjOwnerHomeReordered==='2')return;
  const tarefas=root.querySelector('#fsjTarefasNaoCumpridas');
  const tv=root.querySelector('#fsjHomeTvButton');
  if(!tarefas||!tv)return;
  const antigoCartao=tarefas.closest('.card'); // Capturar antes de mover o botão.
  const menu=document.createElement('div');
  menu.id='fsjOwnerSingleHome';
  menu.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;width:100%;align-content:start;box-sizing:border-box';
  const ids=['fsjHomeTvButton','fsjHomeEmergencyTasksRow','fsjHomePeopleLeavesRow','fsjHomeRunningTasksButton','fsjHomeAvisosDiagnosticoRow'];
  for(const id of ids){
   const el=root.querySelector('#'+id);
   if(el){el.style.margin='0';el.style.width='100%';el.style.minWidth='0';menu.append(el);}
  }
  const overdue=document.createElement('div');overdue.id='fsjHomeOverdueRow';
  overdue.style.cssText='grid-column:1/-1';
  tarefas.style.cssText='background:#176341;color:#fff;border:0;border-radius:10px;min-height:48px;padding:8px;font-weight:700;width:100%';
  overdue.append(tarefas);menu.append(overdue);
  // Preservar os botões restantes da antiga tela inicial, sem duplicar IDs.
  const outros=[...root.querySelectorAll('button')].filter(btn=>!menu.contains(btn)&&!btn.closest('#fsjAplicativosNativos')&&!btn.closest('#fsjOwnerIndicatorsRow'));
  for(const btn of outros){
   if(btn.closest('#fsjOwnerIndicatorsRow'))continue; // Indicadores são consultas, não botões de menu.
   if(btn.closest('.card')||btn.parentElement===root){
    btn.style.cssText+=';background:#176341;color:white;border:0;border-radius:10px;min-height:48px;padding:8px;font-weight:700;width:100%';
    const wrapper=document.createElement('div');wrapper.style.cssText='min-width:0';wrapper.append(btn);menu.append(wrapper);
   }
  }
  const indicadores=root.querySelector('#fsjOwnerIndicatorsRow');
  if(indicadores)root.prepend(indicadores);
  root.prepend(menu); // Somente conteúdo do dashboard; cabeçalho externo intocado.
  if(antigoCartao)antigoCartao.remove();
  // Preservar indicadores e elementos de sincronizacao: nunca remover dados do painel.
  // Avisos e agenda permanecem montados para suas rotinas, mas nao ocupam a tela inicial.
  for(const id of ['fsjAplicativosNativos','retornosSyncStatus']){
   const el=root.querySelector('#'+id);if(el)el.classList.add('fsj-owner-home-secondary');
  }
  const agenda=root.querySelector('#folgasResumo')?.closest('.card');if(agenda)agenda.classList.add('fsj-owner-home-secondary');
  // Layout compacto exclusivamente para a tela inicial do proprietário móvel.
  const style=document.createElement('style');style.textContent=
   '@media(max-width:700px){#fsjOwnerSingleHome{break-inside:avoid;column-span:all!important}'+
   '#fsjOwnerSingleHome button{font-size:clamp(12px,3.2vw,15px)!important;min-height:42px!important;padding:6px!important;line-height:1.15!important}'+
   '#fsjOwnerSingleHome #fsjHomeTvButton,#fsjOwnerSingleHome #fsjHomeRunningTasksButton,#fsjOwnerSingleHome #fsjHomeOverdueRow{grid-column:1/-1!important}'+
   '#fsjOwnerSingleHome #fsjHomeEmergencyTasksRow,#fsjOwnerSingleHome #fsjHomePeopleLeavesRow,#fsjOwnerSingleHome #fsjHomeAvisosDiagnosticoRow{grid-column:1/-1!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}'+
   '#dashboard .fsj-page-flow{row-gap:0!important}'+
   '#dashboard .fsj-owner-home-secondary{display:none!important}'+
   '#dashboard.fsj-owner-single-page .fsj-page-navigation{display:none!important}'+
   '#dashboard.fsj-owner-single-page .fsj-page-viewport{overflow-y:auto!important;overflow-x:hidden!important;height:100%!important}'+
   '#dashboard.fsj-owner-single-page .fsj-page-flow{display:flex!important;flex-direction:column!important;column-count:auto!important;columns:auto!important;width:100%!important;height:auto!important;gap:6px!important}'+
   '#dashboard.fsj-owner-single-page #fsjOwnerSingleHome{order:2!important}'+
   '#dashboard.fsj-owner-single-page #fsjOwnerIndicatorsRow{order:1!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:4px!important;width:100%!important}'+
   '#dashboard.fsj-owner-single-page #fsjOwnerIndicatorsRow .kpi{min-width:0!important;padding:5px 2px!important;text-align:center!important;font-size:10px!important}'+
   '#dashboard.fsj-owner-single-page #fsjOwnerIndicatorsRow .kpi b{font-size:20px!important}'+
   '}';
  document.head.append(style);
  root.dataset.fsjOwnerHomeReordered='2';
 }
 function setup(root){
  organizarInicioProprietario(root);
  const viewport=element('div','fsj-page-viewport'),flow=element('div','fsj-page-flow');
  while(root.firstChild)flow.append(root.firstChild);
  viewport.append(flow);
  for(const label of flow.querySelectorAll('label')){const control=label.nextElementSibling;if(control?.matches('input:not([type=hidden]),select,textarea')){const group=element('div','fsj-control-group');label.before(group);group.append(label,control);}}
  if(root.id==='dashboard'){root.classList.remove('grid');flow.classList.add('grid');}

  // Exclusivo do Proprietario Celular: cartoes responsivos e paginacao unica.
  const executionStyle=document.createElement('style');
  executionStyle.id='fsj-owner-execution-mobile-style';
  executionStyle.textContent='@media(max-width:700px){'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile{min-width:0!important;max-width:100%!important;padding:8px!important;box-sizing:border-box!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile .fsj-page-navigation{display:none!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile>.fsj-page-navigation{display:none!important;height:0!important;padding:0!important;margin:0!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile .fsj-page-flow>h2{margin:2px 0!important;font-size:18px!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile .fsj-page-flow>p{margin:2px 0!important;font-size:12px!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista section>h3{margin:4px 0!important;font-size:15px!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista section article p{margin:2px 0!important;font-size:13px!important;line-height:1.25!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista section article .fsj-task-number{font-size:15px!important;padding:6px!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista section article{padding:7px!important;margin:4px 0!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile .fsj-page-viewport{overflow-x:hidden!important;overflow-y:auto!important;min-width:0!important;width:100%!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile .fsj-page-flow{display:flex!important;flex-direction:column!important;columns:auto!important;column-count:auto!important;width:100%!important;height:auto!important;gap:8px!important;min-width:0!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista{width:100%!important;min-width:0!important;overflow:visible!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista section{width:100%!important;min-width:0!important;box-sizing:border-box!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista article{width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow-wrap:anywhere!important;margin:6px 0!important;padding:10px!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoLista button{max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important}'+
   '#gestor #tarefasEmExecucao.fsj-owner-execution-mobile #fsjExecucaoPaginador{position:static!important;display:flex!important;flex-wrap:wrap!important;gap:8px!important;max-width:100%!important;box-sizing:border-box!important;margin:8px 0!important}'+
   '}';
  document.head.append(executionStyle);
  const footer=element('nav','fsj-page-navigation');footer.setAttribute('aria-label','Páginas desta tela');
  const prev=element('button',''),next=element('button',''),status=element('span','fsj-page-count');
  prev.type=next.type='button';prev.textContent='←';next.textContent='→';prev.className=next.className='fsj-nav-arrow';prev.setAttribute('aria-label','Anterior');next.setAttribute('aria-label','Próximo');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const answer=location.pathname.endsWith('/responder.html')?flow.querySelector('#taskAnswer'):null;
  const answerAnchor=answer?document.createComment('fsj-task-answer-original-position'):null;if(answer)answer.before(answerAnchor);
   const navRow=element('div','fsj-page-nav-row');navRow.append(prev,status,next);footer.append(navRow);
  // Preservar a estrutura original de páginas e a navegação móvel.
  root.append(viewport,footer);root.classList.add('fsj-page-shell');
  if(root.id==='dashboard'&&root.dataset.fsjOwnerHomeReordered==='2')root.classList.add('fsj-owner-single-page');
  // Tarefas em Execucao: paginação própria, sem segunda barra do paginador global.
  if(root.id==='tarefasEmExecucao'&&document.getElementById('gestor'))root.classList.add('fsj-owner-execution-mobile');
  const state={root,viewport,flow,footer,prev,next,status,index:0,count:1,stride:0,pendingIndex:null,answer,answerAnchor};states.set(root,state);
  prev.onclick=()=>{if(location.pathname.endsWith('/quadro.html')&&state.index===0){const t=new URLSearchParams(location.hash.slice(1)).get('token')||'';if(/^[0-9a-f-]{36}$/i.test(t)){location.assign('./inicio-usuario.html?fsj_atualizar='+Date.now()+'#token='+encodeURIComponent(t));}return;}if(state.index>0){turn(state,state.index-1);return;}if(location.pathname.endsWith('/quadro.html')){const t=new URLSearchParams(location.hash.slice(1)).get('token')||'';if(/^[0-9a-f-]{36}$/i.test(t)){location.replace('./inicio-usuario.html?fsj_atualizar='+Date.now()+'#token='+encodeURIComponent(t));return;}return;}goBack();};next.onclick=()=>turn(state,state.index+1);
  viewport.addEventListener('scroll',()=>{if(!mobile.matches)return;const index=Math.round(viewport.scrollLeft/state.stride);if(Number.isFinite(index)&&index!==state.index){state.index=index;update(state);}});
  flow.addEventListener('focusin',event=>{if(!mobile.matches)return;reveal(state,event.target);});
  flow.addEventListener('load',schedule,true);
  flow.addEventListener('click',event=>{
   if(!location.pathname.endsWith('/quadro.html'))return;
   const link=event.target.closest?.('a[href]');if(!link)return;
   const url=new URL(link.href,location.href);
   if(url.origin!==location.origin||!url.pathname.endsWith('/responder.html'))return;
   const params=new URLSearchParams(url.hash.slice(1));params.set('pagina',String(state.index));url.hash=params.toString();link.href=url.href;
  },true);
  // Styling written by the pager is excluded to avoid observer feedback loops.
  new MutationObserver(records=>{if(records.some(record=>record.target!==flow||record.type!=='attributes'))schedule();}).observe(flow,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','style']});
  return state;
 }
 function previousURL(){
  const link=document.querySelector('[data-fsj-screen-back]:not([hidden])');
  if(!link?.getAttribute('href'))return null;
  try{const url=new URL(link.getAttribute('href'),location.href),base=new URL('.',location.href);if(url.origin===base.origin&&[new URL('index.html',base).pathname,new URL('quadro.html',base).pathname,new URL('inicio-usuario.html',base).pathname].includes(url.pathname))return url.href;}catch{}
  return null;
 }
 function canGoBack(){return typeof window.fsjCanGoBack==='function'?window.fsjCanGoBack():!!previousURL();}
 function goBack(){if(typeof window.fsjGoBack==='function')window.fsjGoBack();else{const url=previousURL();if(url)location.assign(url);}}
 function update(state){
  state.index=Math.max(0,Math.min(state.count-1,state.index));
  state.prev.disabled=state.index===0&&location.pathname.endsWith('/quadro.html')?false:state.index===0&&!canGoBack();state.next.disabled=state.index===state.count-1;
  state.status.textContent=(state.index+1)+' / '+state.count;
  state.status.setAttribute('aria-label','Página '+(state.index+1)+' de '+state.count);
  const showAnswer=!!state.answer&&!!window.fsjTaskAnswerVisible?.();
  if(state.answer){state.answer.hidden=!showAnswer;}state.status.hidden=false;
  state.footer.hidden=(state.root.classList.contains('fsj-owner-single-page')||state.root.classList.contains('fsj-owner-execution-mobile'));
 }
 function turn(state,index){
  state.index=index;update(state);
  state.viewport.scrollLeft=state.index*state.stride;
  state.viewport.scrollTop=0;
 }
 const hasTaskPager=root=>root.classList.contains('fsj-owner-open-tasks')||root.classList.contains('fsj-owner-missed-tasks');
 function reveal(state,target){
  if(hasTaskPager(state.root)||!state.stride||!target.getClientRects().length)return;
  const box=target.getBoundingClientRect(),base=state.viewport.getBoundingClientRect();
  const x=box.left-base.left+state.viewport.scrollLeft;
  turn(state,Math.floor((x+1)/state.stride));
 }
 function layout(reset=false){
  const visual=window.visualViewport;
  document.documentElement.style.setProperty('--fsj-visual-height',(visual?.height||innerHeight)+'px');
  document.documentElement.style.setProperty('--fsj-visual-top',(visual?.offsetTop||0)+'px');
  document.documentElement.classList.toggle('fsj-mobile',mobile.matches);
  if(manager&&typeof window.fsjPlaceBrisa==='function')window.fsjPlaceBrisa();
  for(const state of states.values()){
   if(reset)state.index=0;
   // As listas móveis de tarefas com paginador próprio dispensam o rodapé geral.
   const ownPager=hasTaskPager(state.root);
   if(ownPager)state.footer.remove();
   else if(!state.footer.parentElement)state.viewport.after(state.footer);
   if(!mobile.matches){state.root.style.removeProperty('height');state.viewport.scrollLeft=0;if(state.answer){state.answerAnchor?.after(state.answer);state.answer.hidden=!window.fsjTaskAnswerVisible?.();}continue;}
   // Botões SIM/NÃO fixos no rodapé móvel, visíveis em todas as páginas da tarefa.
    if(state.answer&&state.answer.parentElement!==state.footer)state.footer.prepend(state.answer);
   if(!state.root.getClientRects().length)continue;
   for(const table of state.flow.querySelectorAll('table')){const grid=[];[...table.querySelectorAll('thead tr')].forEach((row,r)=>{grid[r]||=[];let c=0;for(const th of row.cells){while(grid[r][c]!==undefined)c++;for(let y=r;y<r+th.rowSpan;y++){grid[y]||=[];for(let x=c;x<c+th.colSpan;x++)grid[y][x]=th.textContent.trim();}c+=th.colSpan;}});const headers=Array.from({length:Math.max(0,...grid.map(row=>row.length))},(_,c)=>[...new Set(grid.map(row=>row[c]).filter(Boolean))].join(' / '));for(const row of table.querySelectorAll('tbody tr'))[...row.cells].forEach((cell,i)=>{if(headers[i])cell.dataset.label=headers[i];});}
   const visual=window.visualViewport;
   const top=Math.max(0,state.root.getBoundingClientRect().top-(visual?.offsetTop||0));
   const available=Math.max(96,(visual?.height||innerHeight)-top-8);
   state.root.style.height=available+'px';
   if(ownPager)continue;
   // A Brisa fica junto ao seletor Ir para; o rodapé contém apenas navegação.
   if(manager&&typeof window.fsjPlaceBrisa==='function')window.fsjPlaceBrisa();

   // Tela inicial unica do proprietario nao usa paginador.
   state.footer.hidden=(state.root.classList.contains('fsj-owner-single-page')||state.root.classList.contains('fsj-owner-execution-mobile'));
   const width=state.viewport.clientWidth;
   const height=state.viewport.clientHeight;
   if(!width||!height)continue;
   state.flow.style.setProperty('--fsj-page-width',width+'px');
   state.flow.style.setProperty('--fsj-page-height',height+'px');
   state.stride=width+24;
   state.count=(state.root.classList.contains('fsj-owner-single-page')||state.root.classList.contains('fsj-owner-execution-mobile'))?1:Math.max(1,Math.ceil((state.flow.scrollWidth+24-1)/state.stride));
   if(state.pendingIndex!==null&&state.flow.querySelector('#content')?.style.display==='block'){state.index=state.pendingIndex;state.pendingIndex=null;}
   turn(state,state.index);
   if(state.flow.contains(document.activeElement))reveal(state,document.activeElement);
  }
 }
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>layout());}
 const manager=document.getElementById('gestor');
 if(manager){
  [...manager.children].filter(el=>el.matches('div.card,#dashboard')).forEach(setup);
  const login=document.getElementById('loginBox');if(login)setup(login);
  // Existing navigation calls this hook after choosing a tab.
  window.fsjPersonLayout=(reset=false)=>{if(reset)for(const state of states.values())state.index=0;schedule();};
  new MutationObserver(records=>{if(records.some(record=>record.target===manager||states.has(record.target)))schedule();}).observe(manager,{attributes:true,subtree:true,attributeFilter:['class','hidden']});
 }else{
  document.body.classList.add('fsj-reader');
  // Navegação de leitura individual nunca herda a sessão administrativa
  // do mesmo navegador. O token do quadro define a identidade do usuário.
  const back=document.getElementById('screenPrevious');
  if(location.pathname.endsWith('/quadro.html')){
   const token=new URLSearchParams(location.hash.slice(1)).get('token')||'';
   if(/^[0-9a-f-]{36}$/i.test(token)){
    const home='./inicio-usuario.html?fsj_atualizar='+Date.now()+'#token='+encodeURIComponent(token);
    if(back){back.href=home;back.hidden=false;}
    window.fsjCanGoBack=()=>true;
    window.fsjGoBack=()=>location.assign(home);
   }else if(back){back.hidden=true;}
  }

  const main=document.querySelector('main');if(main){const copyright=document.querySelector('body>footer');if(copyright)main.append(copyright);const state=setup(main);if(location.pathname.endsWith('/quadro.html')){const page=new URLSearchParams(location.hash.slice(1)).get('pagina');if(/^\d{1,5}$/.test(page||''))state.pendingIndex=Number(page);}}
 }
 for(const link of document.querySelectorAll('[data-fsj-screen-back]')){link.textContent='←';link.classList.add('fsj-nav-arrow');link.setAttribute('aria-label','Anterior');}
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('scroll',schedule);
 window.addEventListener('pageshow',schedule);document.fonts?.ready.then(schedule);
 document.addEventListener('fsj:page-target',event=>{const target=event.detail;for(const state of states.values())if(state.flow.contains(target))requestAnimationFrame(()=>{layout();reveal(state,target);});});
 document.addEventListener('change',schedule);document.addEventListener('input',schedule);document.addEventListener('fsj:execution-updated',schedule);
 mobile.addEventListener('change',schedule);schedule();
})();
