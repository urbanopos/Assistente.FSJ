/* FSJ_MOBILE_MENU_V1 */
;(()=>{
const nav=document.querySelector('.topnav .inner');if(!nav||document.getElementById('fsjMobileMenu'))return;
const buttons=[...nav.querySelectorAll('button')];if(!buttons.length)return;
const label=document.createElement('label');label.id='fsjMobileMenuLabel';label.htmlFor='fsjMobileMenu';label.textContent='Ir para';
const select=document.createElement('select');select.id='fsjMobileMenu';select.setAttribute('aria-label','Selecionar seção do aplicativo');
buttons.forEach((button,index)=>select.add(new Option(button.textContent.trim(),String(index))));label.append(select);nav.append(label);
function sync(){let active=-1;buttons.forEach((button,index)=>{const option=select.options[index];option.disabled=button.disabled;option.hidden=button.hidden||button.classList.contains('hidden')||button.style.display==='none';if(button.classList.contains('active'))active=index;});select.disabled=buttons.every(b=>b.disabled);if(active>=0)select.value=String(active);}
select.onchange=()=>{const button=buttons[Number(select.value)];if(button&&!button.disabled&&!button.hidden)button.click();sync();};
const observer=new MutationObserver(sync);buttons.forEach(button=>observer.observe(button,{attributes:true,attributeFilter:['class','disabled','hidden','style']}));sync();
const style=document.createElement('style');style.textContent='#fsjMobileMenuLabel{display:none}@media(max-width:700px){.topnav .inner>button,.topnav .inner>a{display:none!important}.topnav .inner{overflow:visible!important;display:block!important;padding:6px 12px!important}#fsjMobileMenuLabel{display:flex;align-items:center;gap:10px;margin:0;font-size:13px;white-space:nowrap}#fsjMobileMenu{width:100%;min-width:0;min-height:42px;margin:0;font:inherit;font-size:16px}}';document.head.append(style);
})();
