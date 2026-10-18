import pathlib,hashlib,datetime,shutil,os,json,sys
JOIN_CODE = "// FSJ_CALL_JOIN_REPAIR_V1\nasync function join(call){\n if(joining||room)return false;\n if(!navigator.mediaDevices?.getUserMedia||!window.RTCPeerConnection){say('Microfone e chamadas indisponíveis neste aparelho.');return false;}\n joining=true;window.fsjCallConnecting=true;\n const generation=++joinGeneration,identity=user?.id;\n let stream=null,admitted=null,stage='microfone';\n const cancelled=()=>generation!==joinGeneration||!user||user.id!==identity;\n try{\n  // O toque da pagina e suspenso antes de iniciar a captura de voz.\n  incomingStop();\n  try{if(incomingAudio?.state==='running')await incomingAudio.suspend();}catch{}\n  if(!room)cleanupMedia();\n  const constraints={video:call.mode==='audio'?false:{width:{ideal:640},height:{ideal:360},facingMode:'user'},audio:{echoCancellation:true,noiseSuppression:true}};\n  try{stream=await navigator.mediaDevices.getUserMedia(constraints);}\n  catch(error){\n   if(!['NotReadableError','AbortError'].includes(error.name)||cancelled())throw error;\n   await new Promise(resolve=>setTimeout(resolve,350));\n   if(cancelled())return false;\n   stream=await navigator.mediaDevices.getUserMedia({...constraints,audio:true});\n  }\n  if(cancelled())return false;\n  stage='entrada na sala';\n  admitted=await api('join',{room:call.id});\n  if(cancelled())return false;\n  local=stream;stream=null;room=admitted.call;nonce=admitted.nonce;cursor=admitted.cursor;\n  stage='preparação de áudio';\n  tile(user.id,user.display_name||user.name,local,true);\n  $('callLive').hidden=false;\n  $('callMic').textContent='Desligar microfone';$('callCamera').textContent='Desligar câmera';\n  $('callCamera').hidden=room.mode==='audio';$('callRecord').hidden=user.role!=='owner'||room.mode==='audio';\n  $('callEnd').hidden=user.id!==room.owner;$('callTitleLive').textContent=room.title;\n  document.dispatchEvent(new Event('fsj:call-joined'));\n  say(user.id===room.owner?'Microfone ligado. Chamada iniciada; aguardando os convidados atenderem.':'Microfone ligado. Conectando com quem chamou…');\n  await listCalls();await poll();return !!room;\n }catch(error){\n  if(cancelled())return false;\n  const failed=admitted;admitted=null;\n  if(failed){room=null;nonce='';cleanupMedia();await api('leave',{room:failed.call.id,nonce:failed.nonce}).catch(()=>{});}\n  const detail=error.name==='NotAllowedError'?'Autorize o microfone nas permissões do aplicativo.':error.name==='NotFoundError'?'Microfone não encontrado neste aparelho.':error.name==='NotReadableError'?'O aparelho não conseguiu iniciar o microfone, mesmo após nova tentativa.':error.message;\n  say('Não foi possível atender ('+stage+'): '+detail+' ['+error.name+']');\n  return false;\n }finally{\n  // Captura adquirida e admissao tardia tambem sao liberadas ao cancelar.\n  stream?.getTracks().forEach(track=>track.stop());\n  if(cancelled()&&admitted)await api('leave',{room:admitted.call.id,nonce:admitted.nonce}).catch(()=>{});\n  joining=false;window.fsjCallConnecting=false;\n }\n}\n"
CALLS_SHA = '69b4342062520e93a365a47b2f7d54b0b506d922c0d23afb2f6640a651df6f03'
APP_SHA = '586d968cb98e9686e1c2b82c30910f1f0f48c935b2d2254ee021b54bac883f50'

def patch_calls(text):
 if 'FSJ_CALL_JOIN_REPAIR_V1' in text:return text
 start=text.index('async function join(call){')
 end=text.index('// FSJ_INCOMING_CALL_V1',start)
 text=text[:start]+JOIN_CODE+'\n'+text[end:]
 assert text.count('sessionGeneration=0;')==1
 text=text.replace('sessionGeneration=0;','sessionGeneration=0,joinGeneration=0;')
 assert text.count('async function leave(announce=true){')==1
 text=text.replace('async function leave(announce=true){','async function leave(announce=true){++joinGeneration;')
 text=text.replace("alert('Falha na chamada: '+e.message);",'')
 return text

def patch_app(text):
 if 'FSJ_CALL_JOIN_REPAIR_V1' in text:return text
 anchor='if(window.fsjWatchActive||'
 assert text.count(anchor)==1,'Protecao de atualizacao diferente do esperado.'
 return text.replace(anchor,'if(window.fsjCallConnecting||window.fsjWatchActive||')+'\n// FSJ_CALL_JOIN_REPAIR_V1: preserva atendimento durante atualizacao.\n'

def install(root):
 root=pathlib.Path(root).resolve()
 paths=[root/'static/calls.js',root/'static/app.js',root/'version.json']
 originals={p:p.read_bytes() for p in paths}
 if all(b'FSJ_CALL_JOIN_REPAIR_V1' in originals[p] for p in paths[:2]):
  print('Correcao ja instalada.');return
 for p,sha in zip(paths[:2],[CALLS_SHA,APP_SHA]):
  if hashlib.sha256(originals[p]).hexdigest()!=sha:raise SystemExit('Versao diferente em '+p.name+'. Nada alterado; envie o arquivo atual para conferencia.')
 version=json.loads(originals[paths[2]]);version['web_version']='atendimento-20261018-01'
 changes={paths[0]:patch_calls(originals[paths[0]].decode()).encode(),paths[1]:patch_app(originals[paths[1]].decode()).encode(),paths[2]:(json.dumps(version,ensure_ascii=False)+'\n').encode()}
 backup=root/'backups'/('atendimento-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
 backup.mkdir(parents=True)
 for p in paths:shutil.copy2(p,backup/p.name)
 try:
  for p,content in changes.items():
   tmp=p.with_name(p.name+'.answer.tmp');tmp.write_bytes(content);shutil.copymode(p,tmp);os.replace(tmp,p)
 except BaseException:
  for p in paths:shutil.copy2(backup/p.name,p)
  raise
 print('Correcao de atendimento aplicada na VM. Backup: '+str(backup))
 print('Telas atualizam ao abrir ou retomar, quando nao houver chamada ou edicao em curso.')
 print('Teste entre os dois celulares ainda necessario. Contas e vinculos nao foram alterados.')


EXPECTED = {'calls.js': ['69b4342062520e93a365a47b2f7d54b0b506d922c0d23afb2f6640a651df6f03', '015ac03e6a04839206788a97f47bdae87da52b99fdce2eb01cf8ed5f73e29250'], 'app.js': ['586d968cb98e9686e1c2b82c30910f1f0f48c935b2d2254ee021b54bac883f50', '026bb61910e6d5e851efe54b7f7ebc73ab957d2bc3f6e8c883e4ad61bd47efe5']}

BASE_CALLS_PATCH=patch_calls
BASE_APP_PATCH=patch_app

def patch_calls_v2(text):
 if 'FSJ_CALL_ACCEPT_REPAIR_V2' in text:return text
 text=BASE_CALLS_PATCH(text)
 anchor='function incomingUpdate(calls){'
 assert text.count(anchor)==1,'Aviso de atendimento diferente do esperado.'
 text=text.replace(anchor,anchor+"\n // FSJ_CALL_ACCEPT_REPAIR_V2: o Android ja confirmou este atendimento.\n if(joining||room||(user?.call_only&&window.FSJAndroid)){incomingStop();return;}\n")
 old="$('callPlayAudio').onclick=()=>{document.querySelectorAll('#callGrid video').forEach(v=>v.play().catch(()=>{}));recordContext?.resume();$('callPlayAudio').hidden=true;};"
 new="$('callPlayAudio').onclick=async()=>{const button=$('callPlayAudio');button.disabled=true;try{const results=await Promise.allSettled([...document.querySelectorAll('#callGrid video')].map(video=>video.play()));const failed=results.some(result=>result.status==='rejected');button.hidden=!failed;if(failed)say('O celular ainda bloqueou a reprodução. Toque novamente em Ativar áudio e vídeo.');recordContext?.resume();}finally{button.disabled=false;}};"
 assert text.count(old)==1,'Controle de reproducao diferente do esperado.'
 return text.replace(old,new)

def install_v2(root):
 root=pathlib.Path(root).resolve();paths=[root/'static/calls.js',root/'static/app.js',root/'version.json'];originals={p:p.read_bytes() for p in paths}
 if b'FSJ_CALL_ACCEPT_REPAIR_V2' in originals[paths[0]]:print('Reparo de aceite unico ja instalado.');return
 for p in paths[:2]:
  if hashlib.sha256(originals[p]).hexdigest() not in EXPECTED[p.name]:raise SystemExit('Versao diferente em '+p.name+'. Nada alterado; envie o arquivo atual para conferencia.')
 version=json.loads(originals[paths[2]]);version['web_version']='atendimento-20261018-02'
 changes={paths[0]:patch_calls_v2(originals[paths[0]].decode()).encode(),paths[1]:BASE_APP_PATCH(originals[paths[1]].decode()).encode(),paths[2]:(json.dumps(version,ensure_ascii=False)+'\n').encode()}
 backup=root/'backups'/('aceite-unico-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
 for p in paths:shutil.copy2(p,backup/p.name)
 try:
  for p,content in changes.items():
   tmp=p.with_name(p.name+'.accept.tmp');tmp.write_bytes(content);shutil.copymode(p,tmp);os.replace(tmp,p)
 except BaseException:
  for p in paths:shutil.copy2(backup/p.name,p)
  raise
 print('Reparo de aceite unico aplicado na VM. Backup: '+str(backup))
 print('O Android atende e a pagina nao pede aceite duplicado. Permissoes do Android preservadas.')
 print('Teste entre os dois celulares e audio nos dois sentidos ainda necessario.')

if __name__=='__main__':install_v2(sys.argv[1] if len(sys.argv)>1 else pathlib.Path.home()/'fsj-video-v001')
