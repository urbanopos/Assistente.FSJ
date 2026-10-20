from pathlib import Path
import sys,datetime,shutil,os
root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001')
p=root/'static/style.css';old=p.read_text(encoding='utf-8');mark='FSJ_KEEP_ACTION_SELECT_V1'
if mark in old:print('Campo de seleção já preservado. Atualize com Ctrl+F5.');raise SystemExit(0)
css='''
/* FSJ_KEEP_ACTION_SELECT_V1 */
#mainNavigation,#fsjDesktopModuleNav{display:none!important}
#content #screenPicker{display:block!important;margin:0 0 6px!important}
#content #screenPicker select{margin-top:2px}
#content #callPanel{padding-top:10px!important}
#fsjCallPreparation #fsjSelectedGuests{display:block!important;position:static;min-height:22px;margin:2px 0 8px!important;overflow-wrap:anywhere}
body.fsj-tv-playback #content #screenPicker{display:none!important}
'''
b=root/'backups'/('manter-selecao-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True);shutil.copy2(p,b/p.name)
t=p.with_suffix('.selecao.tmp');t.write_text(old+css,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
print('INSTALADO: O que deseja fazer? mantido no desktop e celular; somente os dois botões redundantes retirados.')
print('Backup:',b)
print('Atualize com Ctrl+F5. Não precisa reiniciar a VM.')
