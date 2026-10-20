from pathlib import Path
import sys,datetime,shutil,os
MARK='FSJ_MOBILE_TV_FOOTER_ALIGN_V1'
CSS='''
/* FSJ_MOBILE_TV_FOOTER_ALIGN_V1 */
@media(max-width:768px){
 #content #pageControls{display:grid!important;grid-template-columns:54px minmax(0,1fr) 54px!important;align-items:center!important;justify-content:stretch!important;gap:8px!important;box-sizing:border-box;height:52px!important;min-height:52px;flex:none;width:100%;padding:4px 0!important;margin:0!important}
 #content #pageControls #previousPage,#content #pageControls #nextPage{display:flex!important;align-items:center!important;justify-content:center!important;align-self:center!important;width:54px!important;min-width:54px!important;max-width:54px!important;height:44px!important;min-height:44px!important;max-height:44px!important;margin:0!important;padding:0!important;line-height:1!important;font-size:30px!important;box-sizing:border-box;float:none!important;position:static!important;transform:none!important}
 #content #pageControls #previousPage{grid-column:1!important;grid-row:1!important}
 #content #pageControls #pageInfo{grid-column:2!important;grid-row:1!important;align-self:center!important;justify-self:stretch;text-align:center!important;line-height:1.2;margin:0!important;padding:0!important;min-width:0}
 #content #pageControls #nextPage{grid-column:3!important;grid-row:1!important;justify-self:end}
 #content #screenPicker{margin-top:0!important;margin-bottom:4px!important}
 #content #screenPicker select{margin-bottom:0!important}
 #content #projection{margin-top:0!important;padding-top:4px!important}
 #content #projection:not(.fsj-tv-media)>#videoStage.fsj-tv-home{margin-top:0!important}
 #content #projection #fsjTVPoster{margin-top:0!important}
}
'''
root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');p=root/'static/style.css';old=p.read_text(encoding='utf-8')
if MARK in old:print('Rodapé já alinhado. Atualize a aba.');raise SystemExit(0)
if 'FSJ_TV_TWO_PAGES_V1' not in old:raise SystemExit('Instale primeiro as duas telas da TV FSJ. Nada alterado.')
b=root/'backups'/('rodape-tv-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True);shutil.copy2(p,b/p.name)
t=p.with_suffix('.rodape.tmp');t.write_text(old+CSS,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
print('INSTALADO: setas alinhadas e numeração central no celular; espaço acima do banner reduzido.')
print('Backup:',b)
print('Feche e reabra Vídeos e Chamadas no celular. Não precisa reiniciar a VM.')
