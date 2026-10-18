// FSJ_CALL_JOIN_REPAIR_V1
async function join(call){
 if(joining||room)return false;
 if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection){say('Microfone e chamadas indisponíveis neste aparelho.');return false;}
 joining=true;window.fsjCallConnecting=true;
 const generation=++joinGeneration,identity=user?.id;
 let stream=null,admitted=null,stage='microfone';
 const cancelled=()=>generation!==joinGeneration||!user||user.id!==identity;
 try{
  // O toque da pagina e suspenso antes de iniciar a captura de voz.
  incomingStop();
  try{if(incomingAudio?.state==='running')await incomingAudio.suspend();}catch{}
  if(!room)cleanupMedia();
  const constraints={video:call.mode==='audio'?false:{width:{ideal:640},height:{ideal:360},facingMode:'user'},audio:{echoCancellation:true,noiseSuppression:true}};
  try{stream=await navigator.mediaDevices.getUserMedia(constraints);}
  catch(error){
   if(!['NotReadableError','AbortError'].includes(error.name)||cancelled())throw error;
   await new Promise(resolve=>setTimeout(resolve,350));
   if(cancelled())return false;
   stream=await navigator.mediaDevices.getUserMedia({...constraints,audio:true});
  }
  if(cancelled())return false;
  stage='entrada na sala';
  admitted=await api('join',{room:call.id});
  if(cancelled())return false;
  local=stream;stream=null;room=admitted.call;nonce=admitted.nonce;cursor=admitted.cursor;
  stage='preparação de áudio';
  tile(user.id,user.display_name||user.name,local,true);
  $('callLive').hidden=false;
  $('callMic').textContent='Desligar microfone';$('callCamera').textContent='Desligar câmera';
  $('callCamera').hidden=room.mode==='audio';$('callRecord').hidden=user.role!=='owner'||room.mode==='audio';
  $('callEnd').hidden=user.id!==room.owner;$('callTitleLive').textContent=room.title;
  document.dispatchEvent(new Event('fsj:call-joined'));
  say(user.id===room.owner?'Microfone ligado. Chamada iniciada; aguardando os convidados atenderem.':'Microfone ligado. Conectando com quem chamou…');
  await listCalls();await poll();return !!room;
 }catch(error){
  if(cancelled())return false;
  const failed=admitted;admitted=null;
  if(failed){room=null;nonce='';cleanupMedia();await api('leave',{room:failed.call.id,nonce:failed.nonce}).catch(()=>{});}
  const detail=error.name==='NotAllowedError'?'Autorize o microfone nas permissões do aplicativo.':error.name==='NotFoundError'?'Microfone não encontrado neste aparelho.':error.name==='NotReadableError'?'O aparelho não conseguiu iniciar o microfone, mesmo após nova tentativa.':error.message;
  say('Não foi possível atender ('+stage+'): '+detail+' ['+error.name+']');
  return false;
 }finally{
  // Captura adquirida e admissao tardia tambem sao liberadas ao cancelar.
  stream?.getTracks().forEach(track=>track.stop());
  if(cancelled()&&admitted)await api('leave',{room:admitted.call.id,nonce:admitted.nonce}).catch(()=>{});
  joining=false;window.fsjCallConnecting=false;
 }
}
