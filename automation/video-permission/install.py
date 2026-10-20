from pathlib import Path
import sys,shutil,datetime,os,subprocess
MARK='FSJ_VIDEO_PERMISSION_V1'
HELPER='''
# FSJ_VIDEO_PERMISSION_V1
def video_account_allowed(user):
 if user.get('role')=='owner':return True
 uid=user.get('id','')
 if uid.startswith('p:'):pid=uid[2:]
 else:
  with db() as c:link=c.execute('SELECT pessoa_id FROM mirror_links WHERE user_id=?',(uid,)).fetchone()
  if not link:return False
  pid=link['pessoa_id']
 snap,meta=mirror_snapshot()
 if not meta.get('synced_at') or time.time()-float(meta['synced_at'])>180:return False
 return any(p.get('id')==pid and p.get('ativo') is True and p.get('videos_chamadas') is True for p in snap.get('people',[]))
'''
def patch(s,d):
 if MARK in s:raise SystemExit('Integração já instalada.')
 anchors=["  if path=='/api/mirror':return self.reply(obj=mirror_view(user))", "  if path.startswith('/api/password-recovery/'):"," return user if user and mirror_account_allowed(user) else None", "  if not person:return None"]
 for a in anchors:
  if s.count(a)!=1:raise SystemExit('Servidor diferente do esperado. Nada alterado.')
 s=s.replace(anchors[0],"  if (path in ('/api/videos','/api/watch','/api/calls') or path.startswith(('/media/','/download/','/api/library'))) and not video_account_allowed(user):return self.reply(403,{'error':'Vídeos e Chamadas não autorizado pelo proprietário.'})\n"+anchors[0])
 s=s.replace(anchors[1],"  if user and (path.startswith('/api/calls/') or path.startswith('/api/watch/')) and not video_account_allowed(user):return self.reply(403,{'error':'Vídeos e Chamadas não autorizado pelo proprietário.'})\n"+anchors[1])
 s=s.replace(anchors[2]," return user if user and mirror_account_allowed(user) and video_account_allowed(user) else None")
 s=s.replace(anchors[3],"  if not person or not video_account_allowed({'id':uid}):return None")
 s+='\n'+HELPER
 a=" identity=server.call_identity(account)"
 if d.count(a)!=1:raise SystemExit('Recebimento Android diferente do esperado. Nada alterado.')
 d=d.replace(a," if not server.video_account_allowed(account):return reply(403,error='Vídeos e Chamadas não autorizado pelo proprietário.')\n"+a)
 compile(s,'server.py','exec');compile(d,'device_calls.py','exec');return s,d
root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001')
files=[root/'server.py',root/'device_calls.py'];new=patch(*(p.read_text(encoding='utf-8') for p in files))
b=root/'backups'/('permissao-videos-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True)
for p in files:shutil.copy2(p,b/p.name)
try:
 for p,s in zip(files,new):
  t=p.with_suffix('.permission.tmp');t.write_text(s,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
 subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
 subprocess.run(['systemctl','--user','is-active','--quiet','fsj-reserva.service'],check=True)
except Exception:
 for p in files:shutil.copy2(b/p.name,p)
 subprocess.run(['systemctl','--user','restart','fsj-reserva.service']);raise
print('INSTALADO: autorização Vídeos e Chamadas integrada ao cadastro central, inclusive recebimento Android.')
print('Backup:',b)
print('Aguarde até dois minutos após salvar a autorização no principal. A conta do participante deve estar vinculada à pessoa na VM.')
print('Proprietário preservado. Autenticação única do principal permanece exclusiva do proprietário; participantes usam sua conta do Reserva.')
