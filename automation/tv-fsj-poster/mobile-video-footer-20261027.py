#!/usr/bin/env python3
"""Ajuste responsivo do reprodutor TV FSJ. Preserva eventos e arquivos originais."""
from pathlib import Path
import datetime, shutil, os, sys
base=Path(sys.argv[1] if len(sys.argv)>1 else '/home/urbano/fsj-video-v001')
cssfile=base/'static/style.css'
jsfile=base/'static/app.js'
MARK='FSJ_TV_MOBILE_VIDEO_FOOTER_20261027'
CSS="""
/* FSJ_TV_MOBILE_VIDEO_FOOTER_20261027 */
@media(max-width:768px){
 body:has(#projection.fsj-tv-media) #videoStage button:not(#videoFullscreen):not(#fsjStageDeleteVideo)[data-fsj-mobile-hide-previous="1"]{display:none!important}
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media{padding-bottom:72px!important}
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media #videoStage:not(.video-expanded):not(:fullscreen){bottom:82px!important}
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media #videoFullscreen,
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media #showInstitutional{
  position:fixed!important;z-index:2147482000!important;
  bottom:max(12px,env(safe-area-inset-bottom))!important;
  top:auto!important;left:auto!important;right:auto!important;
  transform:none!important;margin:0!important;
  height:48px!important;min-height:48px!important;
  width:calc((100vw - 36px)/2)!important;max-width:none!important;
  padding:8px 6px!important;font-size:clamp(12px,3.5vw,16px)!important;
  line-height:1.2!important;white-space:normal!important;
  display:flex!important;align-items:center!important;justify-content:center!important;
  box-sizing:border-box!important
 }
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media #videoFullscreen{left:12px!important}
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media #showInstitutional{right:12px!important}
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media #videoFullscreen[hidden],
 body:has(#projection.fsj-tv-media) #content #projection.fsj-tv-media #showInstitutional[hidden]{display:none!important}
}
"""
JS="""
/* FSJ_TV_MOBILE_VIDEO_FOOTER_20261027 */
;(()=>{
 const stage=document.getElementById('videoStage');if(!stage)return;
 const update=()=>{
  const mobile=matchMedia('(max-width:768px)').matches;
  for(const el of stage.querySelectorAll('button,a')){
   const label=(el.textContent||el.getAttribute('aria-label')||'').trim();
   if(/^([←\\s]*anterior|voltar anterior)$/i.test(label)){
    if(mobile)el.setAttribute('data-fsj-mobile-hide-previous','1');
    else el.removeAttribute('data-fsj-mobile-hide-previous');
   }
  }
 };
 let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;update();});};
 new MutationObserver(schedule).observe(stage,{childList:true,subtree:true,characterData:true});
 matchMedia('(max-width:768px)').addEventListener('change',schedule);schedule();
})();
"""
if not cssfile.is_file() or not jsfile.is_file():sys.exit('Arquivos da TV FSJ nao encontrados; nada alterado.')
oldcss=cssfile.read_text(encoding='utf-8');oldjs=jsfile.read_text(encoding='utf-8')
if MARK in oldcss or MARK in oldjs:sys.exit('Ajuste ja presente; nada alterado.')
if 'videoFullscreen' not in oldjs or 'showInstitutional' not in oldjs:sys.exit('Controles nao reconhecidos; nada alterado.')
backup=base/'backups'/('tv-video-rodape-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S'))
backup.mkdir(parents=True,exist_ok=False)
for p in (cssfile,jsfile):shutil.copy2(p,backup/p.name)
try:
 for p,old,extra in ((cssfile,oldcss,CSS),(jsfile,oldjs,JS)):
  tmp=p.with_name(p.name+'.fsjtmp')
  tmp.write_text(old+'\n'+extra,encoding='utf-8')
  shutil.copymode(p,tmp)
  os.replace(tmp,p)
except Exception:
 for p in (cssfile,jsfile):shutil.copy2(backup/p.name,p)
 raise
print('AJUSTE_APLICADO: controles do video alinhados no rodape do celular; Anterior ocultado.')
print('BACKUP:',backup)
