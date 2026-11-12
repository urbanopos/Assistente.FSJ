/* TV FSJ: painel único. Mantém iframe, SSO e biblioteca original da VM. */
(function(){
'use strict';
function init(){
 const panel=document.getElementById('videosChamadas'),frame=document.getElementById('fsjVideoFrame');
 if(!panel||!frame||document.getElementById('fsjTvPortal'))return;
 const card=panel.querySelector('.card');if(!card)return;
 panel.classList.add('fsj-tv-fullscreen');
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
 
 @media(max-width:850px){
 body:has(#videosChamadas:not(.hidden)) #videosChamadas.fsj-tv-fullscreen{position:fixed!important;inset:0!important;z-index:9998!important;overflow:hidden!important;background:#0b3025!important;width:100vw!important;height:100dvh!important;padding:0!important}
 #videosChamadas.fsj-tv-fullscreen>.card{padding:0!important;margin:0!important;border:0!important;height:100%!important;overflow:hidden!important;background:#0b3025!important}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal{height:100dvh!important;width:100vw!important;border-radius:0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;padding:max(12px,env(safe-area-inset-top)) 14px max(12px,env(safe-area-inset-bottom))!important}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal .fsj-tv-brand{flex:0 0 auto;padding:5px 0!important}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal .fsj-tv-leaf{font-size:32px}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal h2{font-size:24px;margin:2px}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal .fsj-tv-brand p{margin:3px}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal .fsj-tv-actions{flex:0 0 auto}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortalContent{flex:1 1 auto;min-height:0;overflow:auto}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortalContent #fsjVideoFrame{height:100%!important;min-height:0!important}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal.fsj-tv-viewing .fsj-tv-brand{display:none}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal.fsj-tv-viewing .fsj-tv-actions{grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
 #videosChamadas.fsj-tv-fullscreen #fsjTvPortal.fsj-tv-viewing .fsj-tv-actions button{font-size:11px;padding:9px 2px}
 }
  `;document.head.append(style);
 const info=wrap.querySelector('#fsjTvPortalInfo');
 const fsjTVMobile=/Android|iPhone|iPod/i.test(navigator.userAgent)||navigator.userAgentData?.mobile===true;
 const vmOrigin=new URL(fsjTVMobile&&typeof FSJ_VIDEO_VM_URL==='string'?FSJ_VIDEO_VM_URL:(window.FSJ_VIDEO_VM_URL||'https://192.168.1.114/')).origin;
 let currentSection='inicio';
 function sendSection(section){
  if(frame.contentWindow&&frame.dataset.ssoReady==='1')frame.contentWindow.postMessage({type:'fsj-tv-navigate',section},vmOrigin);
 }
 frame.addEventListener('load',()=>{if(frame.dataset.ssoReady==='1'&&currentSection!=='inicio')sendSection(currentSection)});
 window.addEventListener('message',event=>{if(event.source!==frame.contentWindow||event.origin!==vmOrigin)return;if(event.data?.type==='fsj-sso-ok'&&currentSection!=='inicio')sendSection(currentSection)});
 function connect(kind){
  currentSection=kind;
  wrap.classList.add('fsj-tv-viewing');
  info.textContent=kind==='institucional'?'Acesse o vídeo institucional na aplicação da TV FSJ.':kind==='biblioteca'?'Biblioteca original da VM: vídeos e links do YouTube cadastrados.':'Administração disponível conforme autorização do Proprietário na VM.';
  if(access)access.hidden=false;
  if(frame.dataset.ssoReady==='1'){frame.hidden=false;sendSection(kind);return;}
  if(typeof window.fsjRecarregarVideo==='function')window.fsjRecarregarVideo();
 }
 wrap.addEventListener('click',e=>{
  const b=e.target.closest('[data-tv]');if(!b)return;
  if(b.dataset.tv==='voltar'){currentSection='inicio';wrap.classList.remove('fsj-tv-viewing');frame.hidden=true;window.navTo?.('dashboard');return;}
  connect(b.dataset.tv);
 });
 window.abrirTVFSJPortal=function(){
  if(typeof window.abrirVideosReserva!=='function')return;
  window.abrirVideosReserva();
  currentSection='inicio';wrap.classList.remove('fsj-tv-viewing');
  info.textContent='Escolha uma função da TV FSJ.';
  if(access)access.hidden=false;
  if(frame.dataset.ssoReady==='1')frame.hidden=false;
 };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();