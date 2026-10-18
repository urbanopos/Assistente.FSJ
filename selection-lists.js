/* FSJ_SELECTION_LISTS_V1 */
;(()=>{
const managed=new Map(),booleanIds=new Set(['pactive','pwhatsapp7h','daily','pSupervisor']);
function scan(){
 for(const [source,state] of managed)if(!source.isConnected){state.box.remove();managed.delete(source);}
 for(const source of document.querySelectorAll('.checks')){
  if(managed.has(source))continue;
  const inputs=[...source.querySelectorAll('input[type=checkbox]')];
  if(!inputs.length||inputs.some(x=>booleanIds.has(x.id))||source.querySelector('input:not([type=checkbox])'))continue;
  const box=document.createElement('div');box.className='fsj-selection-list';
  const select=document.createElement('select');select.setAttribute('aria-label','Selecione um item para adicionar');
  const selected=document.createElement('div');selected.className='row';selected.style.marginTop='6px';
  box.append(select,selected);source.before(box);source.style.display='none';
  const state={box,select,selected,signature:null};managed.set(source,state);
  select.onchange=()=>{const input=[...source.querySelectorAll('input[type=checkbox]')][Number(select.value)];if(!input||input.disabled)return;input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));refresh(source,state);};
 }
 for(const [source,state] of managed)refresh(source,state);
}
function refresh(source,state){
 const inputs=[...source.querySelectorAll('input[type=checkbox]')];
 const rows=inputs.map((input,index)=>({input,index,label:input.closest('label')?.textContent.trim()||input.getAttribute('aria-label')||input.value}));
 const signature=JSON.stringify(rows.map(x=>[x.label,x.input.value,x.input.checked,x.input.disabled]));
 if(signature===state.signature)return;state.signature=signature;
 state.select.replaceChildren(new Option('Selecione para adicionar…',''));state.selected.replaceChildren();
 for(const {input,index,label} of rows){
  if(!input.checked){const option=new Option(label,String(index));option.disabled=input.disabled;state.select.add(option);}
  else{const button=document.createElement('button');button.type='button';button.textContent=label+' ×';button.disabled=input.disabled;button.setAttribute('aria-label','Remover '+label);button.onclick=()=>{input.checked=false;input.dispatchEvent(new Event('change',{bubbles:true}));refresh(source,state);};state.selected.append(button);}
 }
 state.select.disabled=!rows.some(x=>!x.input.checked&&!x.input.disabled);
}
scan();setInterval(()=>{if(!document.hidden)scan();},500);
document.addEventListener('change',scan);document.addEventListener('visibilitychange',()=>{if(!document.hidden)scan();});
})();
