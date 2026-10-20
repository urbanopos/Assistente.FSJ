#!/usr/bin/env python3
from pathlib import Path
import sys,shutil,datetime,os
MARKER='FSJ_TV_VIDEO_FILL_V1'
JS='''
/* FSJ_TV_VIDEO_FILL_V1 */
;(()=>{
 const panel=$('projection'),player=$('player');if(!panel||!player)return;
 function layout(active){panel.classList.toggle('fsj-tv-media',active);document.dispatchEvent(new Event('fsj:projection-changed'));}
 const previous=project;
 project=function(video){const result=previous(video);layout(!!video&&(!video.institutional||!!window.fsjWatchActive));return result;};
 player.addEventListener('play',()=>layout(true));
 document.addEventListener('fsj:logout',()=>layout(false));
 if(projectedVideo&&(!$('player').paused||!projectedVideo.institutional))layout(true);
})();
'''
CSS='''
/* FSJ_TV_VIDEO_FILL_V1 */
#content #projection.fsj-tv-media{position:relative!important;min-height:0!important;overflow:hidden!important}
#content #projection.fsj-tv-media>:not(#videoStage):not(#showInstitutional){display:none!important}
#content #projection.fsj-tv-media #videoStage:not(.video-expanded):not(:fullscreen){position:absolute!important;inset:12px 12px 64px!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;display:block!important;background:#15231d;border-radius:9px}
#content #projection.fsj-tv-media #player{display:block;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;object-fit:contain!important;margin:0!important}
#content #projection.fsj-tv-media #player[hidden]{display:none!important}
#content #projection.fsj-tv-media #showInstitutional{position:absolute;left:12px;bottom:10px;z-index:4;margin:0!important;min-height:40px}
#content #projection.fsj-tv-media #videoStage:not(.video-expanded):not(:fullscreen) #videoFullscreen{top:auto!important;right:0!important;bottom:-52px!important;margin:0!important;min-height:40px!important}
#content #projection.fsj-tv-media #fsjTVYoutube{height:100%!important;width:100%!important;min-height:0!important;aspect-ratio:auto!important}
#content #projection.fsj-tv-media #fsjTVYoutube iframe{height:100%!important;width:100%!important;min-height:0!important}
'''
base=Path(sys.argv[1] if len(sys.argv)>1 else '/home/urbano/fsj-video-v001').resolve();app=base/'static/app.js';style=base/'static/style.css'
text=app.read_text()
if MARKER in text:print('Vídeo já ajustado ao quadro branco.');sys.exit(0)
anchor='function units(el){'
if text.count(anchor)!=1 or 'FSJ_TV_POSTER_V1' not in text:raise SystemExit('Interface diferente do esperado. Nada alterado.')
replacement="function units(el){if(el.id==='projection'&&el.classList.contains('fsj-tv-media'))return [$('videoStage'),$('showInstitutional')];"
prepared={app:text.replace(anchor,replacement,1)+JS,style:style.read_text()+CSS}
backup=base/'backups'/('tv-video-quadro-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
for p in prepared:shutil.copy2(p,backup/p.name)
try:
 for p,content in prepared.items():
  tmp=p.with_name(p.name+'.tv-video.tmp');tmp.write_text(content);shutil.copymode(p,tmp);os.replace(tmp,p)
except Exception:
 for p in prepared:shutil.copy2(backup/p.name,p)
 raise
print('INSTALADO: vídeo ocupa o quadro branco, com proporção preservada e controles abaixo.')
print('Backup:',backup)
print('Atualize com Ctrl+F5 e reabra Vídeos e Chamadas. Não precisa reiniciar a VM.')
print('Contas, acesso único, biblioteca, chamadas e rotina das 7h preservados.')
