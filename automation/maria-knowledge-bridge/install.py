#!/usr/bin/env python3
"""Instala somente a ponte documental HTTPS da MarIA; exige servidor ocioso."""
import hashlib,http.client,json,os,py_compile,socket,ssl,subprocess,tempfile,time
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path.home()/'fsj-video-v001'
TRIGGERS=('fsj-update.timer','fsj-update.path')
def ctl(*args,check=True):return subprocess.run(['systemctl','--user',*args],check=check,capture_output=True,text=True,timeout=30)
def probe(path):
 # Pinagem exata do certificado público local, antes de enviar a requisição.
 cert=ssl.PEM_cert_to_DER_cert((ROOT/'dados/tls/servidor.crt').read_text())
 context=ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT);context.check_hostname=False;context.verify_mode=ssl.CERT_NONE
 raw=socket.create_connection(('127.0.0.1',8443),timeout=8)
 tls=context.wrap_socket(raw,server_hostname='localhost')
 try:
  if hashlib.sha256(tls.getpeercert(binary_form=True)).digest()!=hashlib.sha256(cert).digest():raise RuntimeError('Certificado local divergente.')
  tls.sendall(('GET '+path+' HTTP/1.1\r\nHost: localhost:8443\r\nConnection: close\r\n\r\n').encode())
  response=http.client.HTTPResponse(tls);response.begin();payload=response.read(65536)
  return response.status,json.loads(payload)
 finally:tls.close()
def main():
 if os.geteuid()==0:raise RuntimeError('Execute como urbano, sem sudo.')
 server=ROOT/'server.py';module=ROOT/'maria_bridge.py';incoming=Path(__file__).with_name('maria_bridge.py').read_text()
 original=server.read_text();marker='# MARIA_DOCUMENTAL_BRIDGE_V1'
 needle="if __name__=='__main__':"
 if marker in original:print('A ponte já está instalada. Nenhum serviço foi reiniciado.');return
 if original.count(needle)!=1:raise RuntimeError('Estrutura do servidor não reconhecida.')
 if not (Path.home()/'maria-fsj/knowledge.json').is_file():raise RuntimeError('Instale primeiro a base documental.')
 import sys
 sys.path.insert(0,str(ROOT));import fsj_sso
 if not callable(getattr(fsj_sso,'_validate_owner',None)):raise RuntimeError('Validador do Proprietário não localizado.')
 patched=original.replace(needle,marker+'\nfrom maria_bridge import install as maria_documental_install\nmaria_documental_install(globals())\n\n'+needle)
 compile(patched,str(server),'exec');compile(incoming,str(module),'exec')
 active=[unit for unit in TRIGGERS if ctl('is-active',unit,check=False).stdout.strip()=='active']
 flag=ROOT/'dados/updates/applying';owned=False;changed=False;before_module=module.read_bytes() if module.exists() else None
 try:
  for unit in active:ctl('stop',unit)
  if ctl('is-active','fsj-update.service',check=False).stdout.strip() in ('active','activating','deactivating'):raise RuntimeError('Atualizador em andamento. Aguarde a conclusão e tente novamente.')
  flag.parent.mkdir(parents=True,exist_ok=True)
  try:
   descriptor=os.open(flag,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600);os.write(descriptor,b'MarIA documentary bridge');os.close(descriptor);owned=True
  except FileExistsError:raise RuntimeError('Outra atualização está em andamento; nada substituído.')
  status,data=probe('/api/version')
  if status!=200 or 'busy' not in data or data['busy'] is not False:raise RuntimeError('Servidor ocupado ou estado não confirmado. Encerre chamadas/exibições antes da instalação.')
  backup=ROOT/'backups'/('maria-documental-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'));backup.mkdir(mode=0o700,parents=True)
  (backup/'server.py').write_text(original)
  if before_module is not None:(backup/'maria_bridge.py').write_bytes(before_module)
  (backup/'installation.json').write_text(json.dumps({'new_module':before_module is None,'changed':['server.py','maria_bridge.py']}))
  temp=module.with_suffix('.pending');temp.write_text(incoming);os.chmod(temp,0o600);os.replace(temp,module)
  temp=server.with_suffix('.pending');temp.write_text(patched);os.chmod(temp,server.stat().st_mode&0o777);os.replace(temp,server);changed=True
  ctl('restart','fsj-reserva.service')
  for attempt in range(10):
   try:
    status,data=probe('/api/maria/status')
    if status==401:break
   except (OSError,http.client.HTTPException):pass
   time.sleep(.5)
  else:raise RuntimeError('A ponte não passou na verificação de autenticação.')
  print('PONTE DOCUMENTAL INSTALADA. Endpoint HTTPS exige a autenticação do Proprietário.')
  print('Backup: '+str(backup))
  print('Modelo de linguagem não ativado. A conexão ao painel web será uma etapa separada.')
 except Exception:
  if changed:
   server.write_text(original)
   if before_module is None:module.unlink(missing_ok=True)
   else:module.write_bytes(before_module)
   ctl('restart','fsj-reserva.service',check=False)
   print('Código anterior restaurado; banco e arquivos operacionais preservados.')
  raise
 finally:
  if owned:flag.unlink(missing_ok=True)
  for unit in active:ctl('start',unit,check=False)
if __name__=='__main__':
 os.umask(0o077)
 try:main()
 except Exception as error:raise SystemExit('Instalação não concluída: '+str(error))
