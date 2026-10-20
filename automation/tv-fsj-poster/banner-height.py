from pathlib import Path
import sys,shutil,datetime,os
root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001')
p=root/'static/style.css';old=p.read_text(encoding='utf-8')
mark='FSJ_TV_BANNER_HEIGHT_V2'
if mark in old:
 print('Altura do banner já ajustada. Atualize com Ctrl+F5.');raise SystemExit(0)
if 'FSJ_TV_BANNER_RESPONSIVE_V1' not in old:raise SystemExit('Instale primeiro o banner responsivo. Nada alterado.')
css='''
/* FSJ_TV_BANNER_HEIGHT_V2 */
@media(min-width:601px){
 #content #fsjTVPoster{min-height:clamp(280px,40vh,420px)!important;gap:18px}
 #content #fsjTVPoster img{height:clamp(140px,23vh,230px)!important;max-width:85%;object-fit:contain}
}
'''
b=root/'backups'/('altura-banner-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True);shutil.copy2(p,b/p.name)
t=p.with_name('style.css.altura.tmp');t.write_text(old+css,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
print('INSTALADO: banner mais alto somente no desktop; celular preservado.')
print('Backup:',b)
print('Atualize com Ctrl+F5. Não precisa reiniciar a VM.')
