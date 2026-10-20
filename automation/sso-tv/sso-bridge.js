/* FSJ_SSO_TV_V1: o token circula somente entre as origens verificadas e o servidor. */
(()=>{
 const embedded=window.parent!==window&&new URLSearchParams(location.search).get('fsj_aba')==='1';
 window.fsjSSOEmbedded=embedded;if(!embedded)return;
 document.documentElement.dataset.fsjSso='pending';
 const parentOrigin='https://urbanopos.github.io',nonce=crypto.randomUUID();let working=false,stopped=false,started=false;
 function message(text){let node=document.getElementById('fsjSSONotice');if(!node){node=document.createElement('p');node.id='fsjSSONotice';node.setAttribute('role','status');document.querySelector('main')?.prepend(node);}if(node)node.textContent=text;}
 function report(type,text){window.parent.postMessage({type,nonce,message:text},parentOrigin);}
 function ready(){if(!stopped){message(started?'':'Conectando com o acesso do Assistente FSJ…');report('fsj-sso-ready');}}
 window.addEventListener('message',async event=>{
  if(event.origin!==parentOrigin||event.source!==window.parent||event.data?.nonce!==nonce)return;
  if(event.data.type==='fsj-sso-logout'){
   stopped=true;try{await fetch('/api/sso/logout',{method:'POST',headers:{'Content-Type':'application/json','X-FSJ-Request':'1'},body:'{}'});}catch{}
   window.fsjSSOLock?.();document.documentElement.dataset.fsjSso='pending';message('Sessão encerrada no principal.');return;
  }
  if(event.data.type!=='fsj-sso-token'||working||stopped||typeof event.data.access_token!=='string')return;
  working=true;
  try{
   const response=await fetch('/api/sso/exchange',{method:'POST',headers:{'Content-Type':'application/json','X-FSJ-Request':'1'},body:JSON.stringify({access_token:event.data.access_token}),cache:'no-store'});
   const result=await response.json();if(!response.ok)throw Error(result.error||'Não foi possível validar o acesso.');
   const check=await fetch('/api/me',{cache:'no-store'}),user=await check.json();
   if(!check.ok||user.sso!==true)throw Error('O navegador bloqueou a sessão da VM nesta aba. Verifique a permissão de cookies do site.');
   if(!started){await window.fsjSSOFinish();started=true;}
   document.documentElement.dataset.fsjSso='ready';message('');report('fsj-sso-ok');
  }catch(error){window.fsjSSOLock?.();started=false;document.documentElement.dataset.fsjSso='pending';message(error.message);report('fsj-sso-error',error.message);}
  finally{working=false;}
 });
 document.addEventListener('DOMContentLoaded',ready,{once:true});
 setInterval(()=>{if(!working&&!document.hidden)ready();},240000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!working)ready();});
})();
