from pathlib import Path
import sys,shutil,datetime,os
MARK='FSJ_COMPACT_MODULE_NAV_V1'
JS=r'''
/* FSJ_COMPACT_MODULE_NAV_V1 */
(()=>{
 const select=document.getElementById('screenSelect'),picker=document.getElementById('screenPicker');if(!select||!picker)return;
 const nav=document.createElement('nav');nav.id='fsjDesktopModuleNav';nav.setAttribute('aria-label','Vídeos e Chamadas');picker.before(nav);
 let signature='';
 function sync(){
  const next=JSON.stringify([...select.options].map(x=>[x.value,x.textContent]));
  if(next!==signature){signature=next;nav.replaceChildren(...[...select.options].map(option=>{const b=document.createElement('button');b.type='button';b.textContent=option.textContent;b.dataset.screen=option.value;b.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();};return b;}));}
  for(const b of nav.children)b.setAttribute('aria-pressed',String(b.dataset.screen===select.value));
 }
 new MutationObserver(sync).observe(select,{childList:true,subtree:true});select.addEventListener('change',sync);document.addEventListener('fsj:call-joined',()=>setTimeout(sync,100));document.addEventListener('fsj:projection-changed',()=>setTimeout(sync,100));sync();
})();
'''
CSS='''
/* FSJ_COMPACT_MODULE_NAV_V1 */
#mainNavigation{display:none!important}
#fsjDesktopModuleNav{display:none}
#content .session{margin:0;font-size:12px}
#content #callPanel{padding-top:10px!important}
#fsjCallPreparation #fsjSelectedGuests{display:block!important;position:static;min-height:22px;margin:2px 0 8px!important;overflow-wrap:anywhere}
@media(min-width:769px){
 #screenPicker{display:none!important}
 #fsjDesktopModuleNav{display:flex;flex-wrap:wrap;gap:5px;flex:none;margin:0 0 6px}
 #fsjDesktopModuleNav button{width:auto;flex:0 1 auto;padding:6px 12px;min-height:34px;margin:0;font-size:13px}
 #fsjDesktopModuleNav button[aria-pressed="true"]{outline:2px solid #357653;outline-offset:-2px}
 body:has(#content:not([hidden]))>header{padding-top:6px;padding-bottom:6px}
}
body.fsj-tv-playback #fsjDesktopModuleNav{display:none!important}
'''
root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');files=[root/'static/app.js',root/'static/style.css'];old=[p.read_text(encoding='utf-8') for p in files]
if MARK in old[0]:raise SystemExit('Navegação compacta já instalada. Atualize com Ctrl+F5.')
if 'FSJ_SINGLE_CALL_FORM_V1' not in old[0]:raise SystemExit('Formulário de chamada não localizado. Nada alterado.')
new=[old[0]+JS,old[1]+CSS];b=root/'backups'/('navegacao-compacta-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True)
for p in files:shutil.copy2(p,b/p.name)
try:
 for p,s in zip(files,new):
  t=p.with_suffix('.compacta.tmp');t.write_text(s,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
except Exception:
 for p in files:shutil.copy2(b/p.name,p)
 raise
print('INSTALADO: botões Tarefas e Vídeos redundantes removidos. Desktop com barra compacta de opções; celular mantém lista de opções.')
print('Backup:',b)
print('Conteúdo elevado e nomes dos convidados visíveis abaixo da seleção. Atualize com Ctrl+F5.')
