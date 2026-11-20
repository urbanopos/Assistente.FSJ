"""Biblioteca FSJ: metadados separados, preservando os vídeos existentes."""
import re, secrets, time
from urllib.parse import urlparse, parse_qs

def youtube_id(value):
 u=urlparse(str(value).strip())
 if u.scheme!='https' or u.username or u.password or u.port not in (None,443):raise ValueError('Use um link HTTPS do YouTube.')
 host=(u.hostname or '').lower()
 if host=='youtu.be': ident=u.path.strip('/')
 elif host in ('youtube.com','www.youtube.com','m.youtube.com'):
  parts=u.path.strip('/').split('/')
  ident=parse_qs(u.query).get('v',[''])[0] if u.path=='/watch' else parts[1] if len(parts)==2 and parts[0] in ('shorts','embed','live') else ''
 else: ident=''
 if not re.fullmatch(r'[A-Za-z0-9_-]{11}',ident):raise ValueError('Link do YouTube inválido.')
 return ident

def metadata(data):
 result={key:str(data.get(key,'')).strip() for key in ('theme','description')}
 if len(result['theme'])>80 or len(result['description'])>500:raise ValueError('Tema: até 80 caracteres. Descrição: até 500.')
 return result

def install(g):
 base_init=g['init']; Handler=g['Handler']; db=g['db']; base_post=Handler.post; base_reply=Handler.reply
 def init():
  base_init()
  with db() as c:c.execute("CREATE TABLE IF NOT EXISTS library_metadata(video_id TEXT PRIMARY KEY,theme TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',youtube_id TEXT NOT NULL DEFAULT '')")
 def enrich(self,status=200,obj=None):
  if isinstance(obj,dict) and isinstance(obj.get('videos'),list):
   with db() as c: rows={r['video_id']:dict(r) for r in c.execute('SELECT * FROM library_metadata')}
   obj={**obj,'videos':[{**v,**{k:val for k,val in rows.get(v['id'],{}).items() if k!='video_id'}} for v in obj['videos']]}
  return base_reply(self,status,obj)
 def post(self):
  path=urlparse(self.path).path
  if path not in ('/api/library/link','/api/library/metadata'):return base_post(self)
  user=self.user()
  if not user or user.get('call_only'):return self.reply(401,{'error':'Entre como Proprietário.'})
  if user['role']!='owner':return self.reply(403,{'error':'Somente o Proprietário cadastra vídeos.'})
  d=self.body()
  try:
   meta=metadata(d)
   if path.endswith('/metadata'):
    ident=str(d.get('id',''))
    with db() as c:
     if not c.execute('SELECT 1 FROM videos WHERE id=?',(ident,)).fetchone():return self.reply(404)
     c.execute("INSERT INTO library_metadata(video_id,theme,description) VALUES(?,?,?) ON CONFLICT(video_id) DO UPDATE SET theme=excluded.theme,description=excluded.description",(ident,meta['theme'],meta['description']))
   else:
    title=str(d.get('title','')).strip(); yt=youtube_id(d.get('url','')); allowed=str(d.get('allowed',''))
    if not title or len(title)>160:raise ValueError('Informe um título de até 160 caracteres.')
    with db() as c:
     known={r['id'] for r in c.execute("SELECT id FROM users WHERE role='viewer' AND status='active'")}
     if allowed!='*' and not set(filter(None,allowed.split(',')))<=known:raise ValueError('Participantes inválidos.')
     ident=secrets.token_hex(16)
     c.execute('INSERT INTO videos(id,title,mime,size,institutional,allowed,created) VALUES(?,?,?,?,?,?,?)',(ident,title,'text/x-youtube',0,0,allowed,time.time()))
     c.execute('INSERT INTO library_metadata VALUES(?,?,?,?)',(ident,meta['theme'],meta['description'],yt))
   return self.reply(201,{'ok':True,'id':ident})
  except ValueError as e:return self.reply(400,{'error':str(e)})
 g['init']=init;Handler.post=post;Handler.reply=enrich
