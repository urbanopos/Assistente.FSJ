from pathlib import Path
import sys,datetime,shutil,os,subprocess
MARK='FSJ_UNIFIED_VIDEO_ACCESS_V1'
EXTRA=r'''
# FSJ_UNIFIED_VIDEO_ACCESS_V1
_validate_owner=validate
def validate(token):
 import re
 if not isinstance(token,str) or not re.fullmatch(r'[0-9a-fA-F-]{36}',token):return _validate_owner(token)
 req=urllib.request.Request(URL+'/rest/v1/rpc/fsj_video_access',data=json.dumps({'quadro_token':token}).encode(),headers={'apikey':KEY,'Content-Type':'application/json'},method='POST')
 try:
  with urllib.request.build_opener(NoRedirect()).open(req,timeout=10) as response:result=json.loads(response.read(8192))
  pid=result.get('person_id');expires=float(result.get('expires',0))
  if not isinstance(pid,str) or not pid or expires<=time.time():raise SSOError(403,'Vídeos e Chamadas não autorizado ou link pessoal expirado.')
  return 'board:'+pid,min(expires,time.time()+900)
 except SSOError:raise
 except Exception:raise SSOError(403,'Não foi possível validar o acesso pessoal no sistema.') from None
'''
OLD='''  with server.db() as c:
   owners=c.execute("SELECT id FROM users WHERE role='owner' AND status='active'").fetchall()
   if len(owners)!=1:raise SSOError(403,'O proprietário local precisa ser verificado na VM.')
   local=owners[0]['id']'''
NEW='''  with server.db() as c:
   if uid.startswith('board:'):
    pid=uid[6:]
    row=c.execute('SELECT u.id,u.status,u.role FROM mirror_links l JOIN users u ON u.id=l.user_id WHERE l.pessoa_id=?',(pid,)).fetchone()
    if row:
     if row['status']!='active' or row['role']!='viewer':raise SSOError(403,'Acesso da pessoa bloqueado.')
     local=row['id']
    else:
     local='central_'+secrets.token_hex(12)
     salt=secrets.token_hex(16)
     c.execute("INSERT INTO users(id,name,hash,salt,role,status,display_name,created) VALUES(?,?,?,?, 'viewer','active',?,?)",(local,local,server.password_hash(secrets.token_urlsafe(48),salt),salt,'Participante',time.time()))
     c.execute('INSERT INTO mirror_links(user_id,pessoa_id) VALUES(?,?)',(local,pid))
   else:
    owners=c.execute("SELECT id FROM users WHERE role='owner' AND status='active'").fetchall()
    if len(owners)!=1:raise SSOError(403,'O proprietário local precisa ser verificado na VM.')
    local=owners[0]['id']'''
def patch(s):
 if MARK in s:raise SystemExit('Acesso unificado já instalado. Atualize o sistema.')
 if s.count(OLD)!=1:raise SystemExit('Integração diferente da esperada. Nada alterado.')
 new=s.replace(OLD,NEW)+'\n'+EXTRA;compile(new,'fsj_sso.py','exec');return new
if __name__=='__main__':
 root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');p=root/'fsj_sso.py';new=patch(p.read_text(encoding='utf-8'))
 b=root/'backups'/('acesso-unico-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True);shutil.copy2(p,b/p.name)
 try:
  t=p.with_suffix('.unificado.tmp');t.write_text(new,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
  subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
  subprocess.run(['systemctl','--user','is-active','--quiet','fsj-reserva.service'],check=True)
 except Exception:
  shutil.copy2(b/p.name,p);subprocess.run(['systemctl','--user','restart','fsj-reserva.service']);raise
 print('INSTALADO: aba Vídeos e Chamadas com o acesso pessoal de tarefas, sem nova senha ou aplicativo separado.')
 print('Backup:',b)
 print('Abra o link pessoal de tarefas e toque em Vídeos e Chamadas. A caixa em Pessoas deve estar marcada e o cadastro ativo.')
