#!/usr/bin/env python3
from pathlib import Path
import sys,shutil,datetime,os
CSS='''
/* FSJ_TV_HOME_FULL_V1 */
#videoStage.fsj-tv-home{position:fixed!important;inset:0!important;z-index:1000!important;width:100vw!important;height:100dvh!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;display:flex!important;align-items:center;justify-content:center;border:0;border-radius:0;background:linear-gradient(#bfe4ff,#e3f6d7)}
#videoStage.fsj-tv-home #fsjTVPoster{width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;box-sizing:border-box;gap:clamp(20px,5dvh,52px);padding:24px;border:0;border-radius:0}
#videoStage.fsj-tv-home #fsjTVPoster img{width:clamp(140px,34vw,440px)!important;max-width:80%!important;height:auto!important;max-height:55dvh!important;object-fit:contain}
#content #videoStage.fsj-tv-home #fsjTVStart{flex:none;max-width:90%;font-size:clamp(25px,5vw,42px);padding:12px 30px;min-height:48px}
'''
base=Path(sys.argv[1] if len(sys.argv)>1 else '/home/urbano/fsj-video-v001').resolve()
p=base/'static/style.css';app=base/'static/app.js'
if 'FSJ_TV_POSTER_V1' not in app.read_text():raise SystemExit('A tela TV FSJ precisa estar instalada. Nada alterado.')
text=p.read_text()
if 'FSJ_TV_HOME_FULL_V1' in text:print('Tela inicial ampliada já instalada.');sys.exit(0)
backup=base/'backups'/('tv-tela-inteira-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True);shutil.copy2(p,backup/p.name)
temp=p.with_name('style.css.tv-inteira.tmp');temp.write_text(text+CSS);shutil.copymode(p,temp);os.replace(temp,p)
print('INSTALADO: tela inicial da TV FSJ ocupa toda a área visível do módulo.')
print('Backup:',backup)
print('Atualize o principal com Ctrl+F5 e reabra Vídeos e Chamadas. Vídeo, acesso e rotina das 7h preservados.')
