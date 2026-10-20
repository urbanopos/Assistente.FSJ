from pathlib import Path
import sys,shutil,datetime,os
MARK='FSJ_ANSWER_VISIBLE_V1'
OLD="accept.onclick=()=>{const id=incomingId,c=pendingCall?.id===id?pendingCall:incomingDialog.fsjCall;incomingStop();if(c)join(c);};"
NEW="""/* FSJ_ANSWER_VISIBLE_V1 */accept.onclick=async()=>{
 const id=incomingId,c=incomingDialog.fsjCall?.id===id?incomingDialog.fsjCall:pendingCall;
 if(!c||joining||room)return;
 accept.disabled=true;
 try{
  const picker=$('screenSelect');if(picker&&[...picker.options].some(x=>x.value==='callPanel')){picker.value='callPanel';picker.dispatchEvent(new Event('change',{bubbles:true}));}
  incomingStop();
  const connected=await join(c);
  if(!connected&&!room){
   const detail=$('callStatus').textContent||'Não foi possível entrar na chamada.';
   alert(detail+'\\nConfira as permissões de câmera e microfone deste navegador.');
  }
 }catch(error){alert('Falha ao aceitar: '+error.name+' — '+error.message);}
 finally{accept.disabled=false;}
};"""
root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');p=root/'static/calls.js';s=p.read_text(encoding='utf-8')
if MARK in s:raise SystemExit('Aceite visível já instalado. Atualize nos dois aparelhos.')
if s.count(OLD)!=1:raise SystemExit('Código de aceite diferente. Nada alterado.')
s=s.replace(OLD,NEW)
# Clean all peer resources when the page is actually closed, including a surviving outgoing tone.
end="""
// FSJ_END_RESOURCES_V1
window.addEventListener('pagehide',()=>{
 const previous=room,previousNonce=nonce;
 outgoingStop();incomingStop();++joinGeneration;room=null;nonce='';cleanupMedia();
 if(previous&&previousNonce){try{fetch('/api/calls/leave',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json','X-FSJ-Request':'1'},body:JSON.stringify({room:previous.id,nonce:previousNonce})}).catch(()=>{});}catch{}}
});
"""
a='window.fsjCallsPause='
if s.count(a)!=1:raise SystemExit('Encerramento diferente do esperado. Nada alterado.')
s=s.replace(a,end+'\n'+a)
b=root/'backups'/('aceite-visivel-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True);shutil.copy2(p,b/p.name)
t=p.with_suffix('.aceite.tmp');t.write_text(s,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
print('INSTALADO: Aceitar abre a tela da chamada; falhas de entrada mostram o motivo. Fechar a página libera câmera, microfone e conexões.')
print('Backup:',b)
print('Atualize nos dois aparelhos, teste Aceitar e copie a mensagem completa caso apareça. Não precisa reiniciar a VM.')
