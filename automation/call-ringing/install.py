from pathlib import Path
import sys,datetime,shutil,os,subprocess,json,base64,zlib,ssl,urllib.request,time,hashlib
PAYLOAD='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'
MARK='FSJ_CALL_CONTROLS_COMPLETE_V1'
CSS='''
/* FSJ_CALL_CONTROLS_COMPLETE_V1 */
#content #callPanel{overflow:auto!important;min-height:0}
#fsjCallPreparation{max-height:100%;overflow:auto;padding-bottom:8px}
#fsjCallPreparation #callCreate{gap:6px 12px!important}
#fsjCallPreparation #callCreate input:not([type=checkbox]),#fsjCallPreparation #callCreate select{padding:7px 10px;min-height:36px;margin-top:3px}
#fsjCallPreparation #callInviteActions{position:sticky;bottom:0;z-index:5;background:#fff;padding:6px 0}
#fsjCallPreparation #callStart{display:block!important;visibility:visible!important;min-height:44px;position:relative;margin:0!important}
#fsjCallPreparation>p:not(#callStatus){margin:3px 0;font-size:12px}
#callLive:not([hidden]){display:flex!important;flex-direction:column;min-height:0}
#callLive .call-controls{display:flex!important;flex-wrap:wrap;gap:6px;position:sticky;bottom:0;background:#fff;padding:8px 0;z-index:5}
#callLive .call-controls button:not([hidden]){display:block!important;min-height:44px;margin:0}
dialog:has(#fsjIncomingAccept){box-sizing:border-box;max-width:min(94vw,520px);max-height:90dvh;overflow:auto;padding:20px;z-index:10000}
dialog #fsjIncomingAccept,dialog #fsjIncomingDecline{display:inline-block!important;min-height:48px;margin:8px 6px 0 0}
dialog #fsjIncomingDecline{background:#9f3535;color:white}
'''
def prepare(root):
 payload=json.loads(zlib.decompress(base64.b64decode(PAYLOAD)))
 files={name:(root/name).read_text(encoding='utf-8') for name in ['server.py','calls.py','device_calls.py','static/calls.js','static/style.css']}
 if MARK in files['static/style.css']:raise SystemExit('Reparo já instalado. Atualize com Ctrl+F5 nos dois aparelhos.')
 if hashlib.sha256(files['calls.py'].encode()).hexdigest()!='c3b80dc2e72766b3caff84f928fa8ac164c9e97b021f5d3cfd11f13c643603ae':raise SystemExit('Sinalização diferente da revisão recebida. Nada alterado.')
 js=files['static/calls.js']
 for old,new in payload['ops']:
  if js.count(old)!=1:raise SystemExit('Código de chamada diferente do esperado. Nada alterado.')
  js=js.replace(old,new,1)
 files['static/calls.js']=js;files['calls.py']=payload['calls']
 a='CALLS=CallHub(call_account)'
 if files['server.py'].count(a)!=1:raise SystemExit('Inicialização de chamadas diferente. Nada alterado.')
 files['server.py']=files['server.py'].replace(a,"def call_invitee(uid):\n account=call_account(uid)\n if not account:return None\n return call_identity(account)['id'] if not uid.startswith('p:') else uid\nCALLS=CallHub(call_account,call_invitee)")
 a=" calls=server.CALLS.list(identity)['calls']"
 if files['device_calls.py'].count(a)!=1:raise SystemExit('Recebimento Android diferente. Nada alterado.')
 files['device_calls.py']=files['device_calls.py'].replace(a," calls=server.CALLS.list(identity,source='android')['calls']")
 files['static/style.css']+=CSS
 for name,s in files.items():
  if name.endswith('.py'):compile(s,name,'exec')
 return files

def health(root):
 ctx=ssl.create_default_context(cafile=str(root/'dados/tls/fsj-ca.crt'))
 with urllib.request.urlopen('https://127.0.0.1:8443/api/version',context=ctx,timeout=5) as r:return json.load(r)
if __name__=='__main__':
 root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');files=prepare(root)
 if health(root).get('busy'):raise SystemExit('Encerre a chamada ou reprodução antes de instalar. Nada alterado.')
 b=root/'backups'/('chamada-controles-toque-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True)
 for name in files:
  dest=b/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/name,dest)
 try:
  for name,s in files.items():
   p=root/name;t=p.with_suffix('.reparo.tmp');t.write_text(s,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
  subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
  for attempt in range(10):
   try:health(root);break
   except Exception:
    if attempt==9:raise
    time.sleep(.5)
 except Exception:
  for name in files:shutil.copy2(b/name,root/name)
  subprocess.run(['systemctl','--user','restart','fsj-reserva.service']);raise
 print('INSTALADO: Iniciar/Finalizar visíveis, Aceitar/Recusar e sinal sonoro para quem liga.')
 print('Backup:',b)
 print('Atualize com Ctrl+F5 nos dois aparelhos. No celular destinatário, abra a aba Vídeos e Chamadas pelo acesso pessoal e toque uma vez na tela para habilitar áudio do navegador.')
 print('O som de espera não confirma que o celular tocou. Confira o estado de recebimento exibido e faça o teste real nos dois aparelhos.')
 print('Recebimento com navegador fechado ainda depende de serviço Android/notificações; este ajuste não instala um novo aplicativo.')
