/* TV FSJ: painel único. Mantém iframe, SSO e biblioteca original da VM. */
(function(){
'use strict';
function init(){
 const panel=document.getElementById('videosChamadas'),frame=document.getElementById('fsjVideoFrame');
 if(!panel||!frame||document.getElementById('fsjTvPortal'))return;
 const card=panel.querySelector('.card');if(!card)return;
 const wrap=document.createElement('section');wrap.id='fsjTvPortal';
 wrap.innerHTML='<div class="fsj-tv-brand"><div class="fsj-tv-leaf">🌿</div><h2>Fazenda São José</h2><p>TV FSJ · Vídeos e chamadas</p></div><nav class="fsj-tv-actions" aria-label="Navegação da TV FSJ"><button type="button" data-tv="institucional">▶ Vídeo institucional</button><button type="button" data-tv="biblioteca">▦ Biblioteca de vídeos</button><button type="button" data-tv="administracao">⚙ Administração</button><button type="button" data-tv="voltar">← Voltar ao início</button></nav><p id="fsjTvPortalInfo" role="status">Selecione uma função para abrir o canal.</p><div id="fsjTvPortalContent"></div>';
 const content=wrap.querySelector('#fsjTvPortalContent');
 // Reutilizar os elementos operacionais existentes: não duplicar iframe nem biblioteca.
 const state=document.getElementById('fsjVideoEstado'),access=document.getElementById('fsjVideoAcesso'),offline=document.getElementById('fsjVideoForaRede');
 for(const node of [state,access,offline,frame])if(node)content.append(node);
 const legacy=card.querySelector('h3');if(legacy)legacy.hidden=true;
 card.prepend(wrap);
 const style=document.createElement('style');style.textContent=`
 #fsjTvPortal{background:#0b3025;color:#fff;border-radius:16px;padding:16px;text-align:center;min-width:0}
 #fsjTvPortal .fsj-tv-brand{padding:15px 0 12px}
 #fsjTvPortal .fsj-tv-leaf{font-size:44px}
 #fsjTvPortal h2{font-size:clamp(22px,6vw,30px);margin:8px 0}
 #fsjTvPortal .fsj-tv-brand p{color:#d2e5da}
 #fsjTvPortal .fsj-tv-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
 #fsjTvPortal .fsj-tv-actions button{border:1px solid #ffffff55;background:#205d45;color:#fff;border-radius:10px;padding:13px 7px;font-weight:700;cursor:pointer}
 #fsjTvPortal .fsj-tv-actions button:first-child{background:#e4b65e;color:#183b2b;border:0}
 #fsjTvPortalInfo{font-size:13px;margin:12px 0}
 #fsjTvPortalContent{min-width:0}
 #fsjTvPortalContent #fsjVideoAcesso{padding:0!important}
 #fsjTvPortalContent #fsjVideoAcesso>p{display:none}
 #fsjTvPortalContent #fsjTvLoading{padding:12px!important;margin:8px 0;background:#f5f8f5;color:#193b2b;border-radius:10px}
 #fsjTvPortalContent #fsjVideoFrame{width:100%!important;min-height:240px!important;height:min(55dvh,500px)!important;border-radius:10px!important}
 #fsjTvPortalContent #fsjVideoEstado{color:#fff!important;margin:8px 0}
 #fsjTvPortalContent [hidden]{display:none!important}
 `;document.head.append(style);
 const info=wrap.querySelector('#fsjTvPortalInfo');
 function connect(kind){
  info.textContent=kind==='institucional'?'Acesse o vídeo institucional na aplicação da TV FSJ.':kind==='biblioteca'?'Biblioteca original da VM: vídeos e links do YouTube cadastrados.':'Administração disponível conforme autorização do Proprietário na VM.';
  if(access)access.hidden=false;
  if(frame.dataset.ssoReady==='1'){frame.hidden=false;return;}
  if(typeof window.fsjRecarregarVideo==='function')window.fsjRecarregarVideo();
 }
 wrap.addEventListener('click',e=>{
  const b=e.target.closest('[data-tv]');if(!b)return;
  if(b.dataset.tv==='voltar'){window.navTo?.('dashboard');return;}
  connect(b.dataset.tv);
 });
 window.abrirTVFSJPortal=function(){
  if(typeof window.abrirVideosReserva!=='function')return;
  window.abrirVideosReserva();
  info.textContent='Conectando à TV FSJ e à biblioteca existente no servidor Dell…';
  if(access)access.hidden=false;
  if(frame.dataset.ssoReady==='1')frame.hidden=false;
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();