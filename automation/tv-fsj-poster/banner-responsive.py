from pathlib import Path
import sys,shutil,datetime,os
MARK='FSJ_TV_BANNER_RESPONSIVE_V1'
CSS='''
/* FSJ_TV_BANNER_RESPONSIVE_V1 */
#content #videoStage.fsj-tv-home:not(.video-expanded):not(:fullscreen){width:100%!important;max-width:none!important;min-width:0;grid-column:1/-1;flex-basis:100%;height:auto!important;position:relative!important;inset:auto!important;margin:0!important;padding:0!important}
#content #fsjTVPoster{box-sizing:border-box;width:100%!important;max-width:none!important;aspect-ratio:auto!important;height:auto!important;min-height:170px;max-height:none!important;padding:16px;gap:12px;overflow:visible;position:relative}
#content #fsjTVPoster img{width:auto;max-width:100%;height:clamp(90px,14vh,160px);max-height:none;object-fit:contain;flex-shrink:0}
#content #fsjTVStart{position:static!important;max-width:100%;white-space:normal;flex-shrink:0;margin:0!important}
@media(max-width:600px){
 #content #fsjTVPoster{min-height:0;padding:10px;gap:8px}
 #content #fsjTVPoster img{height:clamp(70px,12svh,110px);max-width:80%}
 #content #fsjTVStart{font-size:22px;min-height:44px;padding:8px 18px}
 #content #projection:not(.fsj-tv-media) button,#content #projection:not(.fsj-tv-media) select{max-width:100%;box-sizing:border-box;white-space:normal}
 #content #projection:not(.fsj-tv-media) .projection-choices{display:flex;flex-direction:column;gap:8px}
 #content #projection:not(.fsj-tv-media) p{overflow-wrap:anywhere}
}
'''
def main():
 root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001')
 p=root/'static/style.css';old=p.read_text(encoding='utf-8')
 if MARK in old:print('Banner responsivo já instalado. Atualize com Ctrl+F5.');return
 if '#fsjTVPoster' not in old:raise SystemExit('Banner TV FSJ não localizado. Nada alterado.')
 backup=root/'backups'/('banner-responsivo-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
 backup.mkdir(parents=True);shutil.copy2(p,backup/p.name)
 tmp=p.with_name('style.css.banner.tmp');tmp.write_text(old+CSS,encoding='utf-8');shutil.copymode(p,tmp);os.replace(tmp,p)
 print('INSTALADO: banner TV FSJ em toda a largura disponível; disposição compacta no celular, sem comandos sobre o banner.')
 print('Backup:',backup)
 print('Atualize com Ctrl+F5 e reabra Vídeos e Chamadas. Não precisa reiniciar a VM.')
if __name__=='__main__':main()
