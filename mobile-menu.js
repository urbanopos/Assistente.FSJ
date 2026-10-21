/* FSJ_MOBILE_MENU_V1 */
;(()=>{
const nav=document.querySelector('.topnav .inner');if(!nav||document.getElementById('fsjMobileMenu'))return;
const buttons=[...nav.querySelectorAll('button')];if(!buttons.length)return;
const label=document.createElement('label');label.id='fsjMobileMenuLabel';label.htmlFor='fsjMobileMenu';label.textContent='Ir para';
const select=document.createElement('select');select.id='fsjMobileMenu';select.setAttribute('aria-label','Selecionar seção do aplicativo');
buttons.forEach((button,index)=>select.add(new Option(button.textContent.trim(),String(index))));label.append(select);nav.append(label);
function sync(){let active=-1;buttons.forEach((button,index)=>{const option=select.options[index];option.disabled=button.disabled;option.hidden=button.hidden||button.classList.contains('hidden')||button.style.display==='none';if(button.classList.contains('active'))active=index;});select.disabled=buttons.every(b=>b.disabled);if(active>=0)select.value=String(active);}
select.onchange=()=>{const button=buttons[Number(select.value)];if(button&&!button.disabled&&!button.hidden)button.click();sync();};
// A mesma Brisa permanece montada; a navegação não recria o avatar nem seus eventos.
const mobile=matchMedia('(max-width:700px)');
function placeAssistant(){
 const assistant=document.getElementById('brisaFab');if(!assistant)return;
 const target=mobile.matches?nav:document.body;
 if(assistant.parentElement!==target)target.append(assistant);
}
window.fsjPlaceBrisa=placeAssistant;
mobile.addEventListener('change',placeAssistant);placeAssistant();
const observer=new MutationObserver(sync);buttons.forEach(button=>observer.observe(button,{attributes:true,attributeFilter:['class','disabled','hidden','style']}));sync();
const style=document.createElement('style');style.textContent=`
#fsjMobileMenuLabel{display:none}
@media(max-width:700px){
 .topnav .inner>button,.topnav .inner>a{display:none!important}
 .topnav .inner{overflow:visible!important;display:flex!important;align-items:center;gap:8px;padding:6px 12px!important}
 #fsjMobileMenuLabel{display:flex;flex:1;min-width:0;align-items:center;gap:6px;margin:0;font-size:13px;white-space:nowrap}
 #fsjMobileMenu{flex:1;width:100%;min-width:0;min-height:42px;margin:0;font:inherit;font-size:16px}
 .topnav .inner>button.brisa-fab{display:block!important;position:relative!important;inset:auto!important;flex:0 0 46px;width:46px!important;height:46px!important;min-width:46px!important;min-height:46px!important;margin:0!important;padding:0!important;transform:none!important;z-index:auto}
}`;document.head.append(style);
})();