/* FSJ_SSO_TV_WEB_V1 */
(()=>{
 const frame=document.getElementById('fsjVideoFrame'),state=document.getElementById('fsjVideoEstado');if(!frame||!state)return;
 const vm=new URL(FSJ_VIDEO_VM_URL);let nonce='',working=false;
 const note=state.nextElementSibling;if(note?.textContent.includes('autenticação única'))note.textContent='A TV FSJ usa o acesso do Assistente FSJ. A VM verifica a identidade e a autorização do proprietário. Outros perfis permanecem bloqueados.';
 async function access(){let token=await recuperarAcessoGestor();if(!token)throw Error('Entre no Assistente FSJ para abrir a TV FSJ.');let exp=0;try{const data=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');exp=JSON.parse(atob(data)).exp||0;}catch{}if(exp<Date.now()/1000+90)token=await renovarSessao();return token;}
 window.addEventListener('message',async event=>{
  if(event.source!==frame.contentWindow||event.origin!==vm.origin||!fsjPainelPronto||window.fsjExited)return;
  const data=event.data;if(!data||typeof data.nonce!=='string'||!/^[0-9a-f-]{36}$/i.test(data.nonce))return;
  if(data.type==='fsj-sso-ready'){
   nonce=data.nonce;if(working)return;working=true;
   try{const token=await access();if(window.fsjExited)return;frame.contentWindow.postMessage({type:'fsj-sso-token',nonce,access_token:token},vm.origin);state.textContent='Validando o acesso na VM…';}
   catch(error){state.textContent=error.message;}finally{working=false;}
  }else if(data.nonce===nonce&&data.type==='fsj-sso-ok'){state.textContent='TV FSJ conectada com seu acesso do Assistente FSJ.';frame.dataset.ssoReady='1';}
  else if(data.nonce===nonce&&data.type==='fsj-sso-error'){state.textContent=String(data.message||'Acesso não autorizado.');delete frame.dataset.ssoReady;}
 });
 abrirVideosReserva=function(button){
  if(!fsjPainelPronto||window.fsjExited)return;
  navTo('videosChamadas',button);
  if(!frame.dataset.ssoLoaded){const url=new URL(vm);url.searchParams.set('fsj_aba','1');frame.dataset.ssoLoaded='1';state.textContent='Conectando à TV FSJ com seu acesso…';frame.src=url.href;}
  else state.textContent=frame.dataset.ssoReady?'TV FSJ conectada. Sua reprodução e suas chamadas foram preservadas.':'Aguardando validação do acesso pela VM…';
 };
 const previousExit=sairGestor;
 sairGestor=function(){if(nonce)frame.contentWindow?.postMessage({type:'fsj-sso-logout',nonce},vm.origin);return previousExit();};
})();

/* FSJ_TV_VISIBLE_WINDOW_V1 */
(()=>{
 const frame=document.getElementById('fsjVideoFrame'),panel=document.getElementById('videosChamadas');if(!frame||!panel)return;
 let pending=0;
 function fit(){cancelAnimationFrame(pending);pending=requestAnimationFrame(()=>{if(panel.classList.contains('hidden'))return;const top=frame.getBoundingClientRect().top,height=Math.max(0,Math.floor((window.visualViewport?.height||innerHeight)-top-12));if(height<80)return;frame.style.minHeight='0';frame.style.height=height+'px';});}
 window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);frame.addEventListener('load',fit);
 new MutationObserver(fit).observe(panel,{attributes:true,attributeFilter:['class']});
 const state=document.getElementById('fsjVideoEstado');if(state)new MutationObserver(fit).observe(state,{childList:true,subtree:true});
 fit();
})();
