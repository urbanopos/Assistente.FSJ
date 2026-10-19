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


AUTO_LOGIN_CODE = "/* FSJ_AUTO_LOGIN_V1 */\n;(()=>{\nif(window.fsjAutoLoginInstalled)return;window.fsjAutoLoginInstalled=true;\nconst el=id=>document.getElementById(id),bridge=window.FSJAndroid;\nif(!el('loginForm')||!bridge?.savedLogin||!bridge?.saveLogin)return;\nlet started=false,created=null;\nconst creation=el('createPasswordForm');\nif(creation){\n const label=document.createElement('label');label.className='check';\n const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.id='fsjRememberCreated';checkbox.checked=true;\n label.append(checkbox,document.createTextNode('Salvar acesso neste aparelho'));creation.append(label);\n creation.addEventListener('submit',()=>{\n  const first=el('createPassword')?.value,repeat=el('repeatPassword')?.value;\n  created=first&&first===repeat?{password:first,remember:checkbox.checked}:null;\n },true);\n}\ndocument.addEventListener('fsj:session',event=>{\n if(!created)return;const data=created;created=null;\n // A senha só é salva depois de a VM confirmar a conta autenticada.\n const user=event.detail||window.fsjCurrentUser;\n if(user?.name)bridge.saveLogin(user.name,data.password,data.remember);\n});\n// Sair explicitamente cancela o acesso salvo, sem interferir em fechar/minimizar.\nel('logout')?.addEventListener('click',()=>bridge.saveLogin('','',false),true);\nasync function start(){\n if(started)return;started=true;\n try{\n  const saved=JSON.parse(bridge.savedLogin()||'{}');\n  if(!saved.name||!saved.password)return;\n  // Nunca substitui uma sessão existente, inclusive a sessão restrita de chamada.\n  const response=await fetch('/api/me',{credentials:'same-origin',cache:'no-store'});\n  if(response.ok)return;\n  if(response.status!==401&&response.status!==403)return;\n  if(window.fsjCurrentUser||el('content')?.hidden===false)return;\n  el('name').value=saved.name;el('password').value=saved.password;\n  if(el('rememberLogin'))el('rememberLogin').checked=true;\n  el('loginForm').requestSubmit();\n }catch{/* Falha de rede mantém o login disponível, sem tentativas em ciclo. */}\n}\nif(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();\n})();\n"
CALL_SESSION_CODE = "/* FSJ_CALL_AUTH_V3: sessao temporaria da chamada; nao usa senha nem acesso geral. */\n;(()=>{\n 'use strict';\n let started=false,ended=false,sessionUser=null,checking=false;\n const status=text=>{for(const id of ['status','callStatus']){const node=document.getElementById(id);if(node)node.textContent=text;}};\n async function finish(){\n  if(ended)return;ended=true;\n  window.fsjCallsStop?.();\n  try{await fetch('/api/device-calls/logout',{method:'POST',credentials:'same-origin',signal:AbortSignal.timeout(5000),headers:{'Content-Type':'application/json','X-FSJ-Request':'1'},body:'{}'});}catch{}\n  window.FSJAndroid?.callEnded?.();\n }\n async function readSession(){\n  const response=await fetch('/api/me',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(10000)});\n  if(!response.ok){const error=Error('Sessão da chamada indisponível.');error.status=response.status;throw error;}\n  const user=await response.json();\n  if(!user.call_only||!user.call_room)throw Error('O servidor não confirmou uma sessão restrita para esta chamada.');\n  return user;\n }\n async function start(){\n  if(started||ended)return;started=true;\n  try{\n   let user;\n   for(let attempt=0;attempt<3;attempt++){\n    try{user=await readSession();break;}catch(error){if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,500));}\n   }\n   if(ended)return;\n   document.getElementById('fsjRetryCallSession')?.remove();\n   sessionUser=user;window.fsjCurrentUser=user;\n   document.dispatchEvent(new CustomEvent('fsj:session',{detail:user}));\n   // O identificador vem da sessao validada pelo servidor; nao e consumido\n   // de um evento Android que pode ter chegado antes de a pagina estar pronta.\n   document.dispatchEvent(new CustomEvent('fsj:answer-call',{detail:{id:user.call_room}}));\n  }catch(error){\n   started=false;status('Não foi possível abrir automaticamente a chamada: '+error.message);\n   let retry=document.getElementById('fsjRetryCallSession');\n   if(!retry){retry=document.createElement('button');retry.id='fsjRetryCallSession';retry.type='button';retry.textContent='Tentar atendimento novamente';retry.onclick=start;document.getElementById('status')?.after(retry);}\n  }\n }\n async function heartbeat(){\n  if(!sessionUser||checking||ended)return;checking=true;\n  try{const user=await readSession();if(user.call_room!==sessionUser.call_room)throw Error('Sessão de outra chamada.');}\n  catch(error){if(error.status===401||error.status===403){status('Chamada encerrada.');await finish();}}\n  finally{checking=false;}\n }\n document.addEventListener('fsj:call-ended',finish);\n document.addEventListener('visibilitychange',()=>{if(!document.hidden)heartbeat();});\n setInterval(heartbeat,10000);\n start();\n})();\n"
CALL_SESSION_SHA = 'ef3ff9b85b45ad5a926c518bba983aac4b254775bd63e09c640cf8bf09b9406e'

def install_v3(root):
 root=pathlib.Path(root).resolve()
 paths=[root/'static/app.js',root/'static/call-session.js',root/'version.json']
 originals={p:p.read_bytes() for p in paths}
 if b'FSJ_AUTO_LOGIN_V1' in originals[paths[0]] and b'FSJ_CALL_AUTH_V3' in originals[paths[1]]:
  print('Acesso salvo e sessao automatica de chamada ja instalados.');return
 app=originals[paths[0]].decode()
 if 'FSJ_AUTO_LOGIN_V1' not in app:
  if hashlib.sha256(originals[paths[0]]).hexdigest() not in EXPECTED['app.js']:raise SystemExit('app.js diferente da versao conferida. Nada alterado.')
  app=BASE_APP_PATCH(app)+'\n'+AUTO_LOGIN_CODE
 if b'FSJ_CALL_AUTH_V3' not in originals[paths[1]] and hashlib.sha256(originals[paths[1]]).hexdigest()!=CALL_SESSION_SHA:raise SystemExit('call-session.js diferente da versao conferida. Nada alterado.')
 # Confere a restricao de sala existente, sem alterar autenticacao do servidor.
 device=(root/'device_calls.py').read_text()
 if "'call_only':True" not in device or "'call_room':scoped" not in device:raise SystemExit('Sessao restrita de chamada nao localizada. Nada alterado.')
 version=json.loads(originals[paths[2]]);version['web_version']='atendimento-20261018-03'
 changes={paths[0]:app.encode(),paths[1]:CALL_SESSION_CODE.encode(),paths[2]:(json.dumps(version,ensure_ascii=False)+'\n').encode()}
 backup=root/'backups'/('acesso-automatico-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
 for p in paths:shutil.copy2(p,backup/p.name)
 try:
  for p,content in changes.items():
   tmp=p.with_name(p.name+'.auth.tmp');tmp.write_bytes(content);shutil.copymode(p,tmp);os.replace(tmp,p)
 except BaseException:
  for p in paths:shutil.copy2(backup/p.name,p)
  raise
 print('Acesso salvo e atendimento automatico aplicados na VM. Backup: '+str(backup))
 print('Ao abrir o app Android, usa a senha ja salva; ao atender, entra somente na chamada validada pelo servidor.')
 print('Ao encerrar, a sessao da chamada e invalidada; o vinculo do aparelho permanece.')
 print('Ainda necessario testar abertura pelo icone e chamada com audio nos dois sentidos.')

if __name__=='__main__':install_v3(sys.argv[1] if len(sys.argv)>1 else pathlib.Path.home()/'fsj-video-v001')
