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
  prev.type=next.type='button';prev.textContent='Anterior';next.textContent='Próximo';
  status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  footer.append(prev,status,next);root.append(viewport,footer);root.classList.add('fsj-page-shell');
  const state={root,viewport,flow,footer,prev,next,status,index:0,count:1,stride:0};states.set(root,state);
  prev.onclick=()=>turn(state,state.index-1);next.onclick=()=>turn(state,state.index+1);
  viewport.addEventListener('scroll',()=>{if(!mobile.matches)return;const index=Math.round(viewport.scrollLeft/state.stride);if(Number.isFinite(index)&&index!==state.index){state.index=index;update(state);}});
  flow.addEventListener('focusin',event=>{if(!mobile.matches)return;reveal(state,event.target);});
  flow.addEventListener('load',schedule,true);
  // Styling written by the pager is excluded to avoid observer feedback loops.
  new MutationObserver(records=>{if(records.some(record=>record.target!==flow||record.type!=='attributes'))schedule();}).observe(flow,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','style']});
  return state;
 }
 function update(state){
  state.index=Math.max(0,Math.min(state.count-1,state.index));
  state.prev.disabled=state.index===0;state.next.disabled=state.index===state.count-1;
  state.status.textContent=(state.index+1)+' / '+state.count;
  state.status.setAttribute('aria-label','Página '+(state.index+1)+' de '+state.count);
  state.footer.hidden=state.count<2;
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
  document.documentElement.classList.toggle('fsj-mobile',mobile.matches);
  for(const state of states.values()){
   if(reset)state.index=0;
   if(!mobile.matches){state.root.style.removeProperty('height');state.viewport.scrollLeft=0;continue;}
   if(!state.root.getClientRects().length)continue;
   for(const table of state.flow.querySelectorAll('table')){const headers=[...table.querySelectorAll('thead th')].map(th=>th.textContent.trim());for(const row of table.querySelectorAll('tbody tr'))[...row.cells].forEach((cell,i)=>{if(headers[i])cell.dataset.label=headers[i];});}
   const visual=window.visualViewport;
   const top=Math.max(0,state.root.getBoundingClientRect().top-(visual?.offsetTop||0));
   const available=Math.max(96,(visual?.height||innerHeight)-top-8);
   state.root.style.height=available+'px';
   // Always reserve navigation height, so showing it cannot alter page count.
   state.footer.hidden=false;
   const width=state.viewport.clientWidth;
   const height=state.viewport.clientHeight;
   if(!width||!height)continue;
   state.flow.style.setProperty('--fsj-page-width',width+'px');
   state.flow.style.setProperty('--fsj-page-height',height+'px');
   state.stride=width+24;
   state.count=Math.max(1,Math.ceil((state.flow.scrollWidth+24-1)/state.stride));
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
  const main=document.querySelector('main');if(main){const copyright=document.querySelector('body>footer');if(copyright)main.append(copyright);setup(main);}
 }
 window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);
 window.visualViewport?.addEventListener('scroll',schedule);
 window.addEventListener('pageshow',schedule);document.fonts?.ready.then(schedule);
 document.addEventListener('fsj:page-target',event=>{const target=event.detail;for(const state of states.values())if(state.flow.contains(target))requestAnimationFrame(()=>{layout();reveal(state,target);});});
 document.addEventListener('change',schedule);document.addEventListener('input',schedule);
 mobile.addEventListener('change',schedule);schedule();
})();
