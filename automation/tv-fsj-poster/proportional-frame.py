#!/usr/bin/env python3
from pathlib import Path
import sys,datetime,shutil,os
MARK='FSJ_TV_PROPORTIONAL_FRAME_V1'
JS='''
/* FSJ_TV_PROPORTIONAL_FRAME_V1 */
;(()=>{
 const panel=$('projection'),stage=$('videoStage'),player=$('player');if(!panel||!stage||!player)return;
 let scheduled=0;
 const properties=['inset','position','left','right','top','bottom','width','height','transform'];
 function clear(){for(const name of properties)stage.style.removeProperty(name);}
 function fit(){cancelAnimationFrame(scheduled);scheduled=requestAnimationFrame(()=>{
  if(!panel.classList.contains('fsj-tv-media')){clear();return;}
  if(stage.classList.contains('video-expanded')||document.fullscreenElement){clear();return;}
  const availableWidth=Math.max(1,panel.clientWidth-24),availableHeight=Math.max(1,panel.clientHeight-76);
  const ratio=player.videoWidth>0&&player.videoHeight>0?player.videoWidth/player.videoHeight:16/9;
  const width=Math.min(availableWidth,availableHeight*ratio),height=width/ratio;
  const values={position:'absolute',inset:'auto',left:((panel.clientWidth-width)/2)+'px',right:'auto',top:(12+(availableHeight-height)/2)+'px',bottom:'auto',width:width+'px',height:height+'px',transform:'none'};
  for(const [name,value]of Object.entries(values))stage.style.setProperty(name,value,'important');
 });}
 function mode(active){document.body.classList.toggle('fsj-tv-playback',active);if(!active)clear();fit();}
 const previous=project;
 project=function(video){const result=previous(video);mode(panel.classList.contains('fsj-tv-media'));return result;};
 player.addEventListener('play',()=>mode(true));player.addEventListener('loadedmetadata',fit);
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);document.addEventListener('fullscreenchange',fit);
 new MutationObserver(fit).observe(stage,{attributes:true,attributeFilter:['class']});
 if(window.ResizeObserver)new ResizeObserver(fit).observe(panel);
 document.addEventListener('fsj:logout',()=>mode(false));mode(panel.classList.contains('fsj-tv-media'));
})();
'''
CSS='''
/* FSJ_TV_PROPORTIONAL_FRAME_V1 */
body.fsj-tv-playback>header,body.fsj-tv-playback #mainNavigation,body.fsj-tv-playback .session,body.fsj-tv-playback #screenPicker,body.fsj-tv-playback #fsjCallSoundBar,body.fsj-tv-playback #pageControls,body.fsj-tv-playback #status{display:none!important}
body.fsj-tv-playback main{max-width:none!important;width:100%!important;margin:0!important;padding:8px!important}
body.fsj-tv-playback #content{width:100%;min-height:0}
body.fsj-tv-playback #projection{margin:0!important;width:100%;border-radius:10px}
body.fsj-tv-playback #projection #player{object-fit:contain!important;background:#15231d}
'''
base=Path(sys.argv[1] if len(sys.argv)>1 else '/home/urbano/fsj-video-v001').resolve();app=base/'static/app.js';style=base/'static/style.css'
text=app.read_text()
if MARK in text:print('Quadro proporcional já instalado.');sys.exit(0)
if 'FSJ_TV_VIDEO_FILL_V1' not in text:raise SystemExit('Instale primeiro o ajuste do vídeo ao quadro branco. Nada alterado.')
prepared={app:text+JS,style:style.read_text()+CSS}
backup=base/'backups'/('tv-quadro-proporcional-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
for p in prepared:shutil.copy2(p,backup/p.name)
try:
 for p,content in prepared.items():
  tmp=p.with_name(p.name+'.proporcao.tmp');tmp.write_text(content);shutil.copymode(p,tmp);os.replace(tmp,p)
except Exception:
 for p in prepared:shutil.copy2(backup/p.name,p)
 raise
print('INSTALADO: quadro acompanha a proporção original e amplia a imagem na área disponível.')
print('Cabeçalho interno recolhido somente durante a reprodução; Voltar à TV FSJ mantido.')
print('Backup:',backup)
print('Atualize o principal com Ctrl+F5. Acesso, biblioteca e rotina das 7h preservados.')
