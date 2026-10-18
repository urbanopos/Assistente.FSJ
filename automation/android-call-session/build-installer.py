"""Gerar instalador autocontido; executar a partir desta pasta."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent
payload={name:(root/name).read_text() for name in ['device_calls.py','call.html','call-session.js','call-session.css']}
template='''#!/usr/bin/env python3
import pathlib,sys,datetime,shutil,subprocess,os,json,hashlib,urllib.request
PAYLOAD=__PAYLOAD__
APK_SHA=__APK_SHA__
APK_URL='https://raw.githubusercontent.com/urbanopos/Assistente.FSJ/main/downloads/FSJ-Reserva-Local-12.apk'
def patch(text):
 if 'FSJ_DEVICE_CALLS_V12' in text:return text
 text='# FSJ_DEVICE_CALLS_V12\\n'+text
 anchor="  path=urlparse(self.path).path; user=self.user()\\n"
 assert text.count(anchor)==1,'Entrada de servidor diferente.'
 text=text.replace(anchor,anchor+"  if path.startswith('/api/device-calls/'):\\n   import device_calls,sys\\n   return device_calls.route(self,sys.modules[__name__],user,path)\\n  if user and user.get('call_only') and path not in ('/api/calls/join','/api/calls/poll','/api/calls/signal','/api/calls/leave','/api/calls/end'):\\n   return self.reply(403,{'error':'Sessao restrita a chamada.'})\\n",1)
 a=text.index(' def user(self):');b=text.index(' def body(self):',a)
 part=text[a:b];old='  return user if user and mirror_account_allowed(user) else None'
 assert part.count(old)==1,'Autenticacao diferente.'
 part=part.replace(old,"  if user and mirror_account_allowed(user):\\n   import device_calls,sys\\n   return device_calls.guard(sys.modules[__name__],token,user)\\n  return None",1);text=text[:a]+part+text[b:]
 old="   try: return self.reply(obj=CALLS.post(call_identity(user),path.rsplit('/',1)[-1],self.body()))"
 assert text.count(old)==1,'Controle de chamadas diferente.'
 text=text.replace(old,"   try:\\n    data=self.body()\\n    if user.get('call_room') and data.get('room')!=user['call_room']:return self.reply(403,{'error':'Outra chamada nao autorizada.'})\\n    return self.reply(obj=CALLS.post(call_identity(user),path.rsplit('/',1)[-1],data))",1)
 old="  if path in ('/','/app.js','/calls.js','/style.css','/logo.webp'):"
 assert text.count(old)==1,'Arquivos estaticos diferentes.'
 text=text.replace(old,"  if path in ('/','/app.js','/calls.js','/style.css','/logo.webp','/call.html','/call-session.js','/call-session.css'):",1)
 text=text.replace("'.webp':'image/webp'}", "'.webp':'image/webp'}",1)
 old="  if path=='/api/mirror':return self.reply(obj=mirror_view(user))"
 assert text.count(old)==1,'Consulta diferente.'
 text=text.replace(old,"  if user.get('call_only') and path not in ('/api/me','/api/calls'):return self.reply(403,{'error':'Sessao restrita a chamada.'})\\n"+old,1)
 old="   identity=call_identity(user);return self.reply(obj={**CALLS.list(identity),'self_id':identity['id']})"
 assert text.count(old)==1,'Lista de chamadas diferente.'
 text=text.replace(old,"   identity=call_identity(user);data=CALLS.list(identity)\\n   if user.get('call_room'):data['calls']=[c for c in data['calls'] if c['id']==user['call_room']]\\n   return self.reply(obj={**data,'self_id':identity['id']})",1)
 compile(text,'server.py','exec');return text
def install(root,restart=True,apk=None):
 root=pathlib.Path(root).resolve();server=root/'server.py';calls=root/'static/calls.js'
 original=server.read_text();new=patch(original)
 js=calls.read_text();anchor='if(user)listCalls();}';replacement="if(user)listCalls();if(old)document.dispatchEvent(new Event('fsj:call-ended'));}"
 if 'fsj:call-ended' not in js:
  assert js.count(anchor)==1,'Finalizacao diferente do esperado.'
  js=js.replace(anchor,replacement,1)
 if apk is None:
  with urllib.request.urlopen(APK_URL,timeout=90) as response:apk=response.read(5000000)
  assert hashlib.sha256(apk).hexdigest()==APK_SHA,'APK nao validado. Nada alterado.'
 changes={server:new.encode(),calls:js.encode(),root/'device_calls.py':PAYLOAD['device_calls.py'].encode()}
 for name in ['call.html','call-session.js','call-session.css']:changes[root/'static'/name]=PAYLOAD[name].encode()
 html=root/'static/index.html'
 if html.exists():
  markup=html.read_text().replace('Android · instalar aplicativo','Android · instalar versao 12').replace('Android · baixar aplicativo','Android · instalar versao 12').replace('href="/baixar/android"','href="/baixar/android?versao=12"')
  changes[html]=markup.encode()
 if apk:
  changes[root/'releases/FSJ-Reserva-VM-V001-Simples.apk']=apk
  version=json.loads((root/'version.json').read_text());assert version.get('android_version',0)<=12,'Android mais novo instalado.'
  version['android_version']=12;changes[root/'version.json']=json.dumps(version).encode()
 backup=root/'backups'/('android-chamadas12-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
 existed={p:p.exists() for p in changes}
 for p in changes:
  if p.exists():
   dest=backup/p.relative_to(root);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
 try:
  for p,value in changes.items():
   p.parent.mkdir(parents=True,exist_ok=True);tmp=p.with_name(p.name+'.android12.tmp');tmp.write_bytes(value)
   if p.exists():shutil.copymode(p,tmp)
   os.replace(tmp,p)
  if restart:subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
 except BaseException:
  for p in changes:
   if existed[p]:shutil.copy2(backup/p.relative_to(root),p)
   else:p.unlink(missing_ok=True)
  if restart:subprocess.run(['systemctl','--user','restart','fsj-reserva.service'])
  raise
 print('INSTALADO NA VM: Reserva Android versao 12 local, chamada recebida e saida automatica ao encerrar.')
 print('Backup:',backup)
 print('Instale a versao 12 nos DOIS celulares e entre uma vez em cada conta. Permita notificacoes e chamadas em tela cheia.')
 print('Contas, senhas, recuperacao por WhatsApp e rotina das 7h preservados. Teste real nos celulares ainda necessario.')
if __name__=='__main__':install(sys.argv[1] if len(sys.argv)>1 else str(pathlib.Path.home()/'fsj-video-v001'))
'''
import hashlib
apk=root.parents[2]/'fsj-android-local12/FSJ-Reserva-VM-V001-Simples.apk'
# O caminho do APK e explicitado pelo processo de compilacao.
import sys
apk=Path(sys.argv[1])
installer=template.replace('__PAYLOAD__',repr(payload)).replace('__APK_SHA__',repr(hashlib.sha256(apk.read_bytes()).hexdigest()))
(root/'install.py').write_text(installer)
