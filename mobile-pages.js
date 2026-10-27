/* Mobile pages use CSS fragmentation: long text continues on the next page.
   Original controls stay mounted, preserving values, files and event handlers. */
(()=>{
 'use strict';
 const mobile=matchMedia('(max-width:700px)'),states=new Map();
 let frame=0;
 const element=(tag,className)=>{const el=document.createElement(tag);el.className=className;return el;};
 function setup(root){
  const viewport=element('div','fsj-page-viewport'),flow=element('div','fsj-page-flow');
  while(root.firstChild)flow.append(root.firstChild);
  viewport.append(flow);
  for(const label of flow.querySelectorAll('label')){const control=label.nextElementSibling;if(control?.matches('input:not([type=hidden]),select,textarea')){const group=element('div','fsj-control-group');label.before(group);group.append(label,control);}}
  if(root.id==='dashboard'){root.classList.remove('grid');flow.classList.add('grid');}
  const footer=element('nav','fsj-page-navigation');footer.setAttribute('aria-label','Páginas desta tela');
  const prev=element('button',''),next=element('button',''),status=element('span','fsj-page-count');
  prev.type=next.type='button';prev.textContent='←';next.textContent='→';prev.className=next.className='fsj-nav-arrow';prev.setAttribute('aria-label','Anterior');next.setAttribute('aria-label','Próximo');
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const answer=location.pathname.endsWith('/responder.html')?flow.querySelector('#taskAnswer'):null;
  const navRow=element('div','fsj-page-nav-row');navRow.append(prev,status,next);if(answer){const execution=flow.querySelector('#executionControl');if(execution)execution.append(answer);else footer.append(answer);}footer.append(navRow);
  // Preservar a estrutura original de páginas e a navegação móvel.
  root.append(viewport,footer);root.classList.add('fsj-page-shell');
  const state={root,viewport,flow,footer,prev,next,status,index:0,count:1,stride:0,pendingIndex:null,answer};states.set(root,state);
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
  const showAnswer=!!state.answer&&!!window.fsjTaskAnswerVisible?.()&&state.index===state.count-1;
  if(state.answer){state.answer.hidden=!showAnswer;}state.status.hidden=false;
  state.footer.hidden=false;
 }
 function turn(state,index){
  state.index=index;update(state);
  state.viewport.scrollLeft=state.index*state.stride;
  state.viewport.scrollTop=0;
 }
 function reveal(state,target){
  if(!state.stride||!target.getClientRects().length)return;
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
   if(!mobile.matches){state.root.style.removeProperty('height');state.viewport.scrollLeft=0;if(state.answer){state.flow.append(state.answer);state.answer.hidden=!window.fsjTaskAnswerVisible?.();}continue;}
   // Answer buttons remain in the navigation footer on mobile.
   if(!state.root.getClientRects().length)continue;
   for(const table of state.flow.querySelectorAll('table')){const grid=[];[...table.querySelectorAll('thead tr')].forEach((row,r)=>{grid[r]||=[];let c=0;for(const th of row.cells){while(grid[r][c]!==undefined)c++;for(let y=r;y<r+th.rowSpan;y++){grid[y]||=[];for(let x=c;x<c+th.colSpan;x++)grid[y][x]=th.textContent.trim();}c+=th.colSpan;}});const headers=Array.from({length:Math.max(0,...grid.map(row=>row.length))},(_,c)=>[...new Set(grid.map(row=>row[c]).filter(Boolean))].join(' / '));for(const row of table.querySelectorAll('tbody tr'))[...row.cells].forEach((cell,i)=>{if(headers[i])cell.dataset.label=headers[i];});}
   const visual=window.visualViewport;
   const top=Math.max(0,state.root.getBoundingClientRect().top-(visual?.offsetTop||0));
   const available=Math.max(96,(visual?.height||innerHeight)-top-8);
   state.root.style.height=available+'px';
   // A Brisa fica junto ao seletor Ir para; o rodapé contém apenas navegação.
   if(manager&&typeof window.fsjPlaceBrisa==='function')window.fsjPlaceBrisa();

   // Always reserve navigation height, so showing it cannot alter page count.
   state.footer.hidden=false;
   const width=state.viewport.clientWidth;
   const height=state.viewport.clientHeight;
   if(!width||!height)continue;
   state.flow.style.setProperty('--fsj-page-width',width+'px');
   state.flow.style.setProperty('--fsj-page-height',height+'px');
   state.stride=width+24;
   state.count=Math.max(1,Math.ceil((state.flow.scrollWidth+24-1)/state.stride));
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
