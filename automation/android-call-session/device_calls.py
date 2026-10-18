"""Vinculo revogavel do aparelho; sessoes temporarias restritas a uma chamada."""
import hashlib,hmac,secrets,sqlite3,time,threading,json
SCOPED={}
LOCK=threading.RLock()
PREFIX='/api/device-calls/'

def db(server):
 path=server.DATA/'call-devices.sqlite'
 c=sqlite3.connect(path,timeout=10);c.row_factory=sqlite3.Row
 import os
 os.chmod(path,0o600)
 c.execute("CREATE TABLE IF NOT EXISTS devices(token TEXT PRIMARY KEY,uid TEXT NOT NULL,fingerprint TEXT NOT NULL,expires REAL NOT NULL,created REAL NOT NULL,ignored TEXT NOT NULL DEFAULT '[]')")
 return c

def digest(token):return hashlib.sha256(token.encode()).hexdigest()

def scoped_room(token):
 with LOCK:return SCOPED.get(token)

def guard(server,token,user):
 scoped=scoped_room(token)
 if not scoped:return user
 identity=server.call_identity(user)
 if any(c['id']==scoped for c in server.CALLS.list(identity)['calls']):
  with server.SESSION_LOCK:server.SESSIONS[token]=(user['id'],time.time()+90)
  return {**user,'call_only':True,'call_room':scoped}
 with server.SESSION_LOCK:server.SESSIONS.pop(token,None)
 with LOCK:SCOPED.pop(token,None)
 return None

def route(handler,server,user,path):
 if not path.startswith(PREFIX):return False
 action=path[len(PREFIX):];data=handler.body()
 def reply(status=200,**obj):handler.reply(status,obj);return True
 if action=='logout':
  token=handler.session_token()
  with server.SESSION_LOCK:server.SESSIONS.pop(token,None)
  with LOCK:SCOPED.pop(token,None)
  handler.send_response(200);handler.headers_common();handler.send_header('Set-Cookie','fsj_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict');handler.send_header('Content-Length','2');handler.end_headers();handler.wfile.write(b'{}');return True
 now=time.time()
 if action=='bind':
  if not user or user.get('call_only'):return reply(403,error='Entre com login e senha para vincular o aparelho.')
  old=str(data.get('previous',''));token=secrets.token_urlsafe(48)
  with server.db() as main:row=main.execute('SELECT hash FROM users WHERE id=?',(user['id'],)).fetchone()
  c=db(server)
  try:
   with c:
    c.execute('DELETE FROM devices WHERE expires<?',(now,))
    if old:c.execute('DELETE FROM devices WHERE token=? AND uid=?',(digest(old),user['id']))
    rows=c.execute('SELECT token FROM devices WHERE uid=? ORDER BY created DESC',(user['id'],)).fetchall()
    for r in rows[4:]:c.execute('DELETE FROM devices WHERE token=?',(r['token'],))
    c.execute('INSERT INTO devices(token,uid,fingerprint,expires,created) VALUES(?,?,?,?,?)',(digest(token),user['id'],row['hash'],now+30*86400,now))
  finally:c.close()
  return reply(token=token,expires_in=30*86400)
 bearer=handler.headers.get('Authorization','')
 if not bearer.startswith('Bearer ') or len(bearer)>200:return reply(401,error='Vinculo indisponivel. Entre novamente.')
 token=bearer[7:];c=db(server)
 try:device=c.execute('SELECT * FROM devices WHERE token=? AND expires>?',(digest(token),now)).fetchone()
 finally:c.close()
 if not device:return reply(401,error='Vinculo expirado. Entre novamente.')
 with server.db() as main:account=main.execute("SELECT * FROM users WHERE id=? AND status='active'",(device['uid'],)).fetchone()
 if not account or not hmac.compare_digest(account['hash'],device['fingerprint']):return reply(401,error='Conta alterada. Entre novamente.')
 account=dict(account)
 if not server.mirror_account_allowed(account):return reply(403,error='Acesso bloqueado.')
 identity=server.call_identity(account)
 if action=='unbind':
  c=db(server)
  try:
   with c:c.execute('DELETE FROM devices WHERE token=?',(digest(token),))
  finally:c.close()
  return reply(ok=True)
 calls=server.CALLS.list(identity)['calls']
 ignored=json.loads(device['ignored'])
 if action=='dismiss':
  room=str(data.get('room',''))
  if room not in [c['id'] for c in calls]:return reply(410,error='Chamada encerrada.')
  c=db(server)
  try:
   with c:c.execute('UPDATE devices SET ignored=? WHERE token=?',(json.dumps((ignored+[room])[-20:]),digest(token)))
  finally:c.close()
  return reply(ok=True)
 calls=[c for c in calls if c['id'] not in ignored]
 if action=='poll':return reply(self_id=identity['id'],calls=calls)
 if action=='answer':
  room=str(data.get('room',''))
  call=next((x for x in calls if x['id']==room),None)
  if not call or call['owner']==identity['id'] or not any(m['id']==call['owner'] and m['present'] for m in call['members']):return reply(410,error='Chamada encerrada.')
  session=secrets.token_urlsafe(32)
  with server.SESSION_LOCK:
   for key,(_,expires) in list(server.SESSIONS.items()):
    if expires<now:
     server.SESSIONS.pop(key,None)
     with LOCK:SCOPED.pop(key,None)
   server.SESSIONS[session]=(account['id'],now+90)
  with LOCK:SCOPED[session]=room
  handler.send_response(200);handler.headers_common();handler.send_header('Set-Cookie','fsj_session='+session+'; Path=/; HttpOnly; Secure; SameSite=Strict');handler.send_header('Content-Type','application/json');handler.send_header('Content-Length','2');handler.end_headers();handler.wfile.write(b'{}');return True
 return reply(404,error='Operacao indisponivel.')
