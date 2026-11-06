/* TV FSJ: navegação no painel autenticado, sem duplicar biblioteca ou dados da VM. */
(function(){
'use strict';
function init(){
 const panel=document.getElementById('videosChamadas'),frame=document.getElementById('fsjVideoFrame');
 if(!panel||!frame)return;
 const card=panel.querySelector('.card');if(!card)return;
 const wrap=document.createElement('section');wrap.id='fsjTvPortal';
 wrap.innerHTML='<div class="fsj-tv-brand"><div class="fsj-tv-leaf">🌿</div><h2>Fazenda São José</h2><p>TV FSJ · Vídeos e chamadas</p></div><nav class="fsj-tv-actions" aria-label="Navegação da TV FSJ"><button type="button" data-tv="institucional">▶ Vídeo institucional</button><button type="button" data-tv="biblioteca">▦ Biblioteca de vídeos</button><button type="button" data-tv="administracao">⚙ Administração</button><button type="button" data-tv="voltar">← Voltar ao início</button></nav><p id="fsjTvPortalInfo" role="status">Selecione uma função da TV FSJ.</p>';
 card.prepend(wrap);
 const style=document.createElement('style');style.textContent='#fsjTvPortal{background:#0b3025;color:white;border-radius:16px;padding:18px;margin-bottom:10px;text-align:center}#fsjTvPortal .fsj-tv-brand{padding:22px 0 12px}#fsjTvPortal .fsj-tv-leaf{font-size:44px}#fsjTvPortal h2{font-size:24px;margin:8px 0}#fsjTvPortal p{color:#d2e5da}#fsjTvPortal .fsj-tv-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}#fsjTvPortal button{border:1px solid #ffffff55;background:#205d45;color:#fff;border-radius:10px;padding:13px 8px;font-weight:700;cursor:pointer}#fsjTvPortal button:first-child{background:#e4b65e;color:#183b2b;border:0}#fsjTvPortalInfo{font-size:13px;margin:12px 0 0}';document.head.append(style);
 const videoAccess=document.getElementById('fsjVideoAcesso');
 const state=document.getElementById('fsjVideoEstado');
 function showLanding(){wrap.hidden=false;frame.hidden=true;if(videoAccess)videoAccess.hidden=true;if(state)state.hidden=true;}
 function showVM(kind){
  wrap.hidden=false;if(videoAccess)videoAccess.hidden=false;
  const labels={institucional:'Abra o vídeo institucional no painel conectado à VM.',biblioteca:'A biblioteca existente será apresentada pela VM. Selecione o vídeo desejado.',administracao:'A gestão de vídeos depende das permissões do Proprietário na VM.'};
  document.getElementById('fsjTvPortalInfo').textContent=labels[kind];
  if(typeof window.fsjRecarregarVideo==='function'&&!frame.dataset.ssoReady)window.fsjRecarregarVideo();
  if(frame.dataset.ssoReady==='1')frame.hidden=false;
 }
 wrap.addEventListener('click',e=>{const b=e.target.closest('[data-tv]');if(!b)return;const kind=b.dataset.tv;if(kind==='voltar'){window.navTo?.('dashboard');return;}showVM(kind)});
 window.abrirTVFSJPortal=function(){if(!window.fsjPainelPronto)return;window.abrirVideosReserva?.();showLanding();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();