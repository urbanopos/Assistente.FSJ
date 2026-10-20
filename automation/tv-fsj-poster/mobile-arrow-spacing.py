from pathlib import Path
import sys,datetime,shutil,os
MARK='FSJ_MOBILE_ARROW_SPACING_V2'
CSS='''
/* FSJ_MOBILE_ARROW_SPACING_V2 */
@media(max-width:768px){
 #content #pageControls{box-sizing:border-box!important;display:grid!important;grid-template-columns:54px minmax(0,1fr) 54px!important;grid-template-rows:44px!important;align-items:center!important;gap:8px!important;width:100%!important;height:52px!important;min-height:52px!important;flex:0 0 52px!important;margin:0!important;padding:4px 0!important;position:relative!important;top:-16px!important;overflow:visible!important;transform:none!important}
 #content #pageControls #previousPage,#content #pageControls #nextPage{box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;width:54px!important;min-width:54px!important;max-width:54px!important;height:44px!important;min-height:44px!important;max-height:44px!important;flex:0 0 54px!important;padding:0!important;margin:0!important;font-family:Arial,sans-serif!important;font-size:30px!important;font-weight:700!important;line-height:44px!important;letter-spacing:normal!important;white-space:nowrap!important;transform:none!important;position:static!important;overflow:visible!important}
 #content #pageControls #previousPage{grid-area:1 / 1!important}
 #content #pageControls #pageInfo{grid-area:1 / 2!important;text-align:center!important;align-self:center!important;margin:0!important;padding:0!important;transform:none!important}
 #content #pageControls #nextPage{grid-area:1 / 3!important;justify-self:end!important}
 #content #projection{margin-bottom:16px!important}
}
'''
root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');p=root/'static/style.css';old=p.read_text(encoding='utf-8')
if MARK in old:print('Espaçamento já corrigido. Reabra a aba no celular.');raise SystemExit(0)
if 'FSJ_TV_TWO_PAGES_V1' not in old:raise SystemExit('Telas da TV FSJ não localizadas. Nada alterado.')
b=root/'backups'/('setas-celular-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True);shutil.copy2(p,b/p.name)
t=p.with_suffix('.setas.tmp');t.write_text(old+CSS,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
print('INSTALADO: rodapé elevado uma linha e botões com dimensão fixa, sem compressão das setas no celular.')
print('Backup:',b)
print('Feche e reabra Vídeos e Chamadas no celular. Não precisa reiniciar a VM.')
