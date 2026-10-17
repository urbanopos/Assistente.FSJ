#!/usr/bin/env python3
"""Ajuste localizado de convites e instalador Android; preserva contas e servidor."""
import fcntl, hashlib, json, os, shutil, sys, time, uuid, urllib.request
from pathlib import Path

MARKER='FSJ_INCOMING_CALL_V1'
APK_HASH='288551902c30102d39115f410e2d4c3af927aba9a7f9e1b979c1426a3cdf8248'
APK_URL='https://raw.githubusercontent.com/urbanopos/Assistente.FSJ/main/downloads/FSJ-Reserva-VM.apk?chamadas=11'
INCOMING=r'''
// FSJ_INCOMING_CALL_V1: convite explícito, somente com sessão aberta.
let incomingDialog=null,incomingId='',incomingTimer=0,incomingDeadline=0,incomingAudio=null;
const ignoredIncoming=new Set();
function incomingStop(){clearInterval(incomingTimer);incomingTimer=0;try{navigator.vibrate?.(0);}catch{}if(incomingDialog?.open)incomingDialog.close();incomingId='';}
function incomingUnlock(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!incomingAudio&&Audio)incomingAudio=new Audio();incomingAudio?.resume().catch(()=>{});}catch{}}
document.addEventListener('pointerdown',incomingUnlock,{passive:true});
function incomingTone(){try{if(window.FSJAndroid?.nativeCallRinging?.())return;}catch{}if(!incomingId||Date.now()>incomingDeadline){clearInterval(incomingTimer);incomingTimer=0;return;}try{navigator.vibrate?.([300,150,300]);}catch{}try{if(incomingAudio?.state!=='running')return;const now=incomingAudio.currentTime;for(const delay of [0,.5]){const tone=incomingAudio.createOscillator(),gain=incomingAudio.createGain();tone.frequency.value=660;gain.gain.setValueAtTime(0,now+delay);gain.gain.linearRampToValueAtTime(.12,now+delay+.03);gain.gain.linearRampToValueAtTime(0,now+delay+.3);tone.connect(gain);gain.connect(incomingAudio.destination);tone.start(now+delay);tone.stop(now+delay+.32);tone.onended=()=>{tone.disconnect();gain.disconnect();};}}catch{}}
function incomingUpdate(calls){
 const call=!room&&user&&calls.find(c=>c.owner!==user.id&&!ignoredIncoming.has(c.id)&&c.members.some(m=>m.id===c.owner&&m.present));
 if(!call){incomingStop();return;}if(incomingId===call.id)return;incomingStop();incomingId=call.id;
 if(!incomingDialog){incomingDialog=document.createElement('dialog');incomingDialog.className='card';incomingDialog.setAttribute('aria-labelledby','fsjIncomingTitle');const title=document.createElement('h2');title.id='fsjIncomingTitle';const info=document.createElement('p');info.id='fsjIncomingInfo';const accept=document.createElement('button');accept.type='button';accept.textContent='Atender chamada';accept.id='fsjIncomingAccept';accept.onclick=()=>{const id=incomingId,c=pendingCall?.id===id?pendingCall:incomingDialog.fsjCall;incomingStop();if(c)join(c);};const later=document.createElement('button');later.type='button';later.textContent='Agora não';later.onclick=()=>{ignoredIncoming.add(incomingId);incomingStop();say('Aviso dispensado. O convite continua na lista de chamadas.');};incomingDialog.addEventListener('cancel',()=>{ignoredIncoming.add(incomingId);incomingStop();});incomingDialog.append(title,info,accept,later);document.body.append(incomingDialog);}
 incomingDialog.fsjCall=call;const caller=call.members.find(m=>m.id===call.owner)?.name||'Proprietário';document.getElementById('fsjIncomingTitle').textContent=(call.mode==='audio'?'Chamada de voz':'Videochamada')+' recebida';document.getElementById('fsjIncomingInfo').textContent=caller+' está chamando. Toque em Atender chamada e autorize o microfone'+(call.mode==='audio'?'.':' e a câmera.');incomingDialog.showModal();incomingDeadline=Date.now()+45000;incomingTone();incomingTimer=setInterval(incomingTone,3500);
}
document.addEventListener('fsj:answer-call',async e=>{if(!user||room||joining)return;try{const d=await api('list');user.id=d.self_id||user.id;const call=d.calls.find(c=>c.id===e.detail?.id);if(call){incomingStop();await join(call);}else say('Este convite já foi encerrado.');}catch(error){say(error.message);}});
document.addEventListener('fsj:logout',()=>{incomingStop();ignoredIncoming.clear();incomingAudio?.close().catch(()=>{});incomingAudio=null;});
'''

def patch(source):
    if MARKER in source:return source
    replacements=[
      ('async function listCalls(){',INCOMING+'\nasync function listCalls(){'),
      ('user.id=d.self_id||user.id;const signature=', 'user.id=d.self_id||user.id;incomingUpdate(d.calls);const signature='),
      ("+'Aguardando os participantes.'", "+'Convite enviado. Aguardando atendimento; os convidados precisam estar com o Reserva aberto e conectados à própria conta.'"),
      ('await listCalls();await poll();}catch(e)', 'await listCalls();await poll();return true;}catch(e)'),
      (":e.message);}finally{joining=false;}}", ":e.message);return false;}finally{joining=false;}}"),
      ("await listCalls();await join(d.call);", "await listCalls();if(!await join(d.call)){await api('end',{room:d.call.id}).catch(()=>{});await listCalls();}"),
    ]
    for old,new in replacements:
        if source.count(old)!=1:raise RuntimeError('Versão de chamadas diferente da esperada. Nada foi alterado: '+old[:60])
        source=source.replace(old,new,1)
    return source

def install(target,download=None):
    file=target/'static/calls.js';apk=target/'releases/FSJ-Reserva-VM-V001-Simples.apk';version=target/'version.json'
    source=file.read_text();result=patch(source);info=json.loads(version.read_text())
    if int(info.get('android_version',0))>11:raise RuntimeError('Android mais recente encontrado; não será substituído.')
    if result==source and apk.is_file() and hashlib.sha256(apk.read_bytes()).hexdigest()==APK_HASH and info.get('android_version')==11:
        print('Chamadas e Android 11 já instalados.');return
    if download is None:
        with urllib.request.urlopen(APK_URL,timeout=30) as response:raw=response.read(5000001)
    else:raw=download()
    if hashlib.sha256(raw).hexdigest()!=APK_HASH:raise RuntimeError('Instalador Android não validado. Nada foi alterado.')
    info['android_version']=11
    files={file:result.encode(),apk:raw,version:(json.dumps(info)+'\n').encode()}
    backup=target/'backups'/('chamadas-'+time.strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:8]);backup.mkdir(parents=True)
    for path in files:
        dest=backup/path.relative_to(target);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dest)
    changed=[]
    try:
        for path,content in files.items():
            temp=path.with_name(path.name+'.'+uuid.uuid4().hex+'.tmp')
            try:temp.write_bytes(content);os.chmod(temp,path.stat().st_mode & 0o777);os.replace(temp,path);changed.append(path)
            finally:temp.unlink(missing_ok=True)
    except Exception:
        for path in changed:shutil.copy2(backup/path.relative_to(target),path)
        raise
    print('INSTALADO NA VM: aviso de chamada recebida e Android 11 com toque exclusivo e recebimento em segundo plano.')
    print('Backup:',backup)
    print('Agora instale a versão 11 nos DOIS celulares, abra o Reserva e permita notificações.')
    print('Não é necessário reiniciar o servidor. Contas, senhas, vídeos e tarefas preservados.')
    print('Áudio e vídeo entre redes diferentes ainda dependem da configuração de conexão da VM; este ajuste não instala o retransmissor TURN.')

def main():
    target=Path(sys.argv[1] if len(sys.argv)>1 else '~/fsj-video-v001').expanduser().resolve()
    lockpath=target/'dados/updates/lock';lockpath.parent.mkdir(parents=True,exist_ok=True)
    with lockpath.open('a') as lock:
        fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
        install(target)

if __name__=='__main__':
    try:main()
    except Exception as error:raise SystemExit('NÃO APLICADO: '+str(error))
