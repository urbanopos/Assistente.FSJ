/* FSJ_LIBRARY_THEMES_V1 */
;(()=>{
 const form=$('uploadForm'),stage=$('videoStage');if(!form||!stage)return;
 // Reserva uma faixa de rodapé, sem cobrir a imagem nem os controles do vídeo.
 const style=document.createElement('style');style.textContent='#videoStage{padding-bottom:56px;box-sizing:border-box}#videoFullscreen{top:auto!important;right:12px!important;bottom:6px!important;min-width:128px!important;min-height:44px!important;width:auto!important;height:auto!important;padding:10px 16px!important;border-radius:12px!important;border:1px solid #ffffff80!important;background:#174b3b!important;color:#fff!important;font:600 15px system-ui!important;box-shadow:0 2px 6px #0004}#videoFullscreen:focus-visible{outline:3px solid #f4ca64;outline-offset:2px}#libraryVideoDescription{line-height:1.5}#libraryYoutube,#libraryTheme,#libraryDescription{box-sizing:border-box;width:100%}';document.head.append(style);
 const fullButton=$('videoFullscreen');
 function buttonLabel(){fullButton.textContent=stage.classList.contains('video-expanded')?'Fechar tela cheia':'Ampliar vídeo';}
 new MutationObserver(buttonLabel).observe(stage,{attributes:true,attributeFilter:['class']});buttonLabel();
 const fields=document.createElement('div');
 fields.innerHTML='<label>Tema<input id="libraryTheme" maxlength="80" list="libraryThemes" placeholder="Aves, gado, plantio, manutenção…"></label><datalist id="libraryThemes"></datalist><label>Breve descrição<textarea id="libraryDescription" maxlength="500" rows="3"></textarea></label><label>Link do YouTube<input id="libraryYoutube" type="url" placeholder="https://www.youtube.com/watch?v=…"></label><p>Escolha um arquivo ou informe um link do YouTube.</p>';
 $('title').closest('label').after(fields);$('file').required=false;
 const filterLabel=document.createElement('label');filterLabel.textContent='Tema da biblioteca';
 const filter=document.createElement('select');filter.id='libraryThemeFilter';filterLabel.append(filter);$('videos').closest('label').before(filterLabel);
 const description=document.createElement('p');description.id='libraryVideoDescription';description.style.whiteSpace='pre-wrap';stage.after(description);
 const frame=document.createElement('iframe');frame.id='libraryYoutubePlayer';frame.title='Vídeo de orientação do trabalho';frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.hidden=true;frame.style.cssText='width:100%;height:100%;min-height:180px;aspect-ratio:16/9;border:0';stage.prepend(frame);
 const baseProject=project,baseUnique=uniqueLibraryVideos;
 function options(){const previous=filter.value,themes=[...new Set(library.filter(v=>!v.institutional).map(v=>v.theme||'Sem tema'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));fsjOptions(filter,[new Option('Todos os temas',''),...themes.map(v=>new Option(v,v))]);if(themes.includes(previous))filter.value=previous;$('libraryThemes').replaceChildren(...themes.filter(t=>t!=='Sem tema').map(t=>new Option(t,t)));}
 uniqueLibraryVideos=function(){return baseUnique().filter(v=>!filter.value||(v.theme||'Sem tema')===filter.value);};
 function list(){fsjOptions($('videos'),[new Option('Selecione…',''),...uniqueLibraryVideos().map(v=>new Option(v.title,v.id))]);}
 filter.onchange=list;
 project=function(video){
  frame.hidden=true;frame.removeAttribute('src');baseProject(video);options();
  description.textContent=video?[video.theme,video.description].filter(Boolean).join(' — '):'';
  if(video?.youtube_id){$('player').pause();$('player').removeAttribute('src');$('player').load();$('player').hidden=true;$('download').hidden=true;$('watchGroup').hidden=true;if(window.FSJAndroid){status('Este Android precisa da atualização do reprodutor para links do YouTube. O vídeo está cadastrado; use o acesso pelo navegador enquanto isso.');return;}frame.src='https://www.youtube.com/embed/'+encodeURIComponent(video.youtube_id)+'?rel=0&autoplay=1';frame.hidden=false;}
  else $('watchGroup').hidden=!owner;
 };
 const baseWatchGroup=$('watchGroup').onclick;
 $('watchGroup').onclick=e=>{if(projectedVideo?.youtube_id||library.find(v=>v.id===$('videos').value)?.youtube_id)return status('Este link pode ser assistido individualmente nesta tela.');return baseWatchGroup?.(e);};
 const baseSave=form.onsubmit;
 form.onsubmit=async e=>{
  e.preventDefault();const url=$('libraryYoutube').value.trim(),file=$('file').files[0];
  if(file&&url)return status('Escolha somente um arquivo ou um link por cadastro.');
  if(!url){if(!file)return status('Selecione um arquivo ou informe um link do YouTube.');return baseSave(e);}
  if(busy)return;busy=true;const button=form.querySelector('button');button.disabled=true;
  try{const allowed=$('everyone').checked?'*':[...document.querySelectorAll('[name=allowed]:checked')].map(x=>x.value).join(',');await api('/api/library/link',{url,title:$('title').value,theme:$('libraryTheme').value,description:$('libraryDescription').value,allowed});form.reset();await refresh();status('Vídeo cadastrado na biblioteca.');}catch(error){status(error.message);}finally{busy=false;button.disabled=false;}
 };
 document.addEventListener('fsj:logout',()=>{frame.removeAttribute('src');frame.hidden=true;description.textContent='';});
})();
