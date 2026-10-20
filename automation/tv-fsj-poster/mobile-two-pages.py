from pathlib import Path
import sys,datetime,shutil,os
MARK='FSJ_TV_TWO_PAGES_V1'
JS=r'''
/* FSJ_TV_TWO_PAGES_V1 */
function fsjTVPageUnits(){
 const panel=document.getElementById('projection'),stage=document.getElementById('videoStage');
 let libraryPage=document.getElementById('fsjTVLibraryPage');
 if(!libraryPage){
  libraryPage=document.createElement('div');libraryPage.id='fsjTVLibraryPage';
  const title=document.createElement('h2');title.textContent='Biblioteca de vídeos';libraryPage.append(title);
  for(const child of [...panel.children]){
   if(['videoStage','showInstitutional','projectionTitle'].includes(child.id))continue;
   libraryPage.append(child);
  }
  panel.append(libraryPage);
 }
 libraryPage.querySelectorAll('.page-flow,.step-hidden').forEach(el=>el.classList.remove('page-flow','step-hidden'));
 const prev=document.getElementById('previousPage'),next=document.getElementById('nextPage');
 if(prev){prev.textContent='←';prev.setAttribute('aria-label','Página anterior');}
 if(next){next.textContent='→';next.setAttribute('aria-label','Próxima página');}
 return [stage,libraryPage];
}
'''
CSS='''
/* FSJ_TV_TWO_PAGES_V1 */
body:has(#content:not([hidden]))>header{display:none!important}
#mainNavigation,#fsjDesktopModuleNav{display:none!important}
#content .session{display:none!important}
#content #screenPicker{display:block!important;flex:none;margin:0 0 8px!important}
#content #screenPicker select{width:100%;box-sizing:border-box;margin-top:4px;min-height:44px}
#content #projection{margin-top:0!important;padding:10px!important;min-height:0}
#projection:not(.fsj-tv-media)>#projectionTitle{display:none!important}
#projection:not(.fsj-tv-media)>#showInstitutional{display:none!important}
#projection:not(.fsj-tv-media)>#videoStage.fsj-tv-home{box-sizing:border-box;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;padding:0!important;margin:0!important;display:flex!important}
#projection:not(.fsj-tv-media) #fsjTVPoster{width:100%!important;flex:1;min-height:0!important;height:100%!important;max-height:none!important;box-sizing:border-box;overflow:hidden;gap:12px;padding:12px}
#projection:not(.fsj-tv-media) #fsjTVPoster img{width:auto!important;height:auto!important;max-width:80%!important;max-height:65%!important;min-height:0;object-fit:contain}
#projection:not(.fsj-tv-media) #fsjTVStart{flex:none;min-height:44px;position:static!important}
#fsjTVLibraryPage{box-sizing:border-box;height:100%;max-height:100%;min-height:0;overflow:auto;width:100%;padding:4px}
#fsjTVLibraryPage h2{margin:0 0 12px}
#fsjTVLibraryPage .projection-choices{display:flex;flex-direction:column;gap:8px}
#fsjTVLibraryPage select,#fsjTVLibraryPage button{box-sizing:border-box;max-width:100%;white-space:normal}
#pageControls{display:flex!important;align-items:center;justify-content:space-between;flex:none;gap:10px}
#pageControls #previousPage,#pageControls #nextPage{width:54px;flex:none;min-height:44px;margin:0;font-size:30px;font-weight:700;padding:0}
#pageInfo{flex:1;text-align:center}
body.fsj-tv-playback #content #screenPicker,body.fsj-tv-playback #pageControls{display:none!important}
#content #projection:not(.fsj-tv-media)>#videoStage.step-hidden,#content #projection>#fsjTVLibraryPage.step-hidden{display:none!important}
'''
def patch(a,c):
 if MARK in a:raise SystemExit('Telas já instaladas. Atualize com Ctrl+F5.')
 anchor='function units(el){';end='if(group.length)pages.push(group);'
 if a.count(anchor)!=1 or a.count(end)!=1 or 'FSJ_TV_POSTER_V1' not in a:raise SystemExit('Interface diferente da esperada. Nada alterado.')
 a=a.replace(anchor,anchor+"if(el.id==='projection'&&!el.classList.contains('fsj-tv-media'))return fsjTVPageUnits();",1)
 a=a.replace(end,end+"if(active==='projection'&&!card.classList.contains('fsj-tv-media'))pages=all.map(el=>[el]);",1)
 return a+'\n'+JS,c+'\n'+CSS
if __name__=='__main__':
 root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');files=[root/'static/app.js',root/'static/style.css'];new=patch(*(p.read_text(encoding='utf-8') for p in files));b=root/'backups'/('tv-duas-telas-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True)
 for p in files:shutil.copy2(p,b/p.name)
 try:
  for p,s in zip(files,new):
   t=p.with_suffix('.telas.tmp');t.write_text(s,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
 except Exception:
  for p in files:shutil.copy2(b/p.name,p)
  raise
 print('INSTALADO: 1/2 TV FSJ e 2/2 biblioteca; cabeçalho interno removido; lista O que deseja fazer? acima e setas com numeração abaixo.')
 print('Backup:',b)
 print('Atualize o principal com Ctrl+F5 e reabra Vídeos e Chamadas no celular. Não precisa reiniciar a VM.')
 print('Autorização, chamadas e rotina das 7h preservadas. Nenhum vídeo ou chamada foi iniciado.')
