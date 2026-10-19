/* FSJ_CALL_AUTH_V3: sessao temporaria da chamada; nao usa senha nem acesso geral. */
;(()=>{
 'use strict';
 let started=false,ended=false,sessionUser=null,checking=false;
 const status=text=>{for(const id of ['status','callStatus']){const node=document.getElementById(id);if(node)node.textContent=text;}};
 async function finish(){
  if(ended)return;ended=true;
  window.fsjCallsStop?.();
  try{await fetch('/api/device-calls/logout',{method:'POST',credentials:'same-origin',signal:AbortSignal.timeout(5000),headers:{'Content-Type':'application/json','X-FSJ-Request':'1'},body:'{}'});}catch{}
  window.FSJAndroid?.callEnded?.();
 }
 async function readSession(){
  const response=await fetch('/api/me',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok){const error=Error('Sessão da chamada indisponível.');error.status=response.status;throw error;}
  const user=await response.json();
  if(!user.call_only||!user.call_room)throw Error('O servidor não confirmou uma sessão restrita para esta chamada.');
  return user;
 }
 async function start(){
  if(started||ended)return;started=true;
  try{
   let user;
   for(let attempt=0;attempt<3;attempt++){
    try{user=await readSession();break;}catch(error){if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,500));}
   }
   if(ended)return;
   document.getElementById('fsjRetryCallSession')?.remove();
   sessionUser=user;window.fsjCurrentUser=user;
   document.dispatchEvent(new CustomEvent('fsj:session',{detail:user}));
   // O identificador vem da sessao validada pelo servidor; nao e consumido
   // de um evento Android que pode ter chegado antes de a pagina estar pronta.
   document.dispatchEvent(new CustomEvent('fsj:answer-call',{detail:{id:user.call_room}}));
  }catch(error){
   started=false;status('Não foi possível abrir automaticamente a chamada: '+error.message);
   let retry=document.getElementById('fsjRetryCallSession');
   if(!retry){retry=document.createElement('button');retry.id='fsjRetryCallSession';retry.type='button';retry.textContent='Tentar atendimento novamente';retry.onclick=start;document.getElementById('status')?.after(retry);}
  }
 }
 async function heartbeat(){
  if(!sessionUser||checking||ended)return;checking=true;
  try{const user=await readSession();if(user.call_room!==sessionUser.call_room)throw Error('Sessão de outra chamada.');}
  catch(error){if(error.status===401||error.status===403){status('Chamada encerrada.');await finish();}}
  finally{checking=false;}
 }
 document.addEventListener('fsj:call-ended',finish);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)heartbeat();});
 setInterval(heartbeat,10000);
 start();
})();
