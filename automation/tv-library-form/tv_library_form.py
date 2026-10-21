"""Tema obrigatório e gestão da biblioteca pela sessão já validada do Assistente FSJ."""
import json, os, re, secrets, time
from urllib.parse import urlparse, parse_qs
THEMES=('Campo','Aviário','Limpeza','Máquinas','Serviços','Outros')
def normalize(value):
 value=str(value or '').strip()
 aliases={'Aves':'Aviário','Animais':'Aviário','Aviario':'Aviário','Plantio':'Campo','Irrigação':'Campo','Maquinas':'Máquinas','Manutenção':'Serviços','Servicos':'Serviços'}
 return value if value in THEMES else aliases.get(value,'Outros')
def theme(value):
 if value not in THEMES:raise ValueError('Escolha um tema antes de continuar.')
 return value
def youtube(value):
 parsed=urlparse(str(value or '').strip())
 if parsed.scheme!='https' or parsed.username or parsed.password:raise ValueError('Informe um link HTTPS do YouTube.')
 host=(parsed.hostname or '').lower()
 if host=='youtu.be':ident=parsed.path.strip('/')
 elif host in ('youtube.com','www.youtube.com','m.youtube.com'):
  ident=parse_qs(parsed.query).get('v',[''])[0] if parsed.path=='/watch' else parsed.path.split('/')[2] if re.fullmatch('/(embed|shorts)/[^/]+/?',parsed.path) else ''
 else:ident=''
 if not re.fullmatch(r'[a-zA-Z0-9_-]{11}',ident):raise ValueError('Link de vídeo do YouTube inválido.')
 return ident
def install(ns):
 H=ns['Handler'];db=ns['db'];DATA=ns['DATA'];ROOT=ns['ROOT'];audit=ns['audit']
 old_init=ns['init']
 def init():
  old_init()
  with db() as c:
   c.execute('CREATE TABLE IF NOT EXISTS library_metadata(video_id TEXT PRIMARY KEY,theme TEXT NOT NULL DEFAULT \'\',description TEXT NOT NULL DEFAULT \'\')')
   c.execute('CREATE TABLE IF NOT EXISTS tv_library_sources(video_id TEXT PRIMARY KEY,youtube_id TEXT,created_by TEXT NOT NULL)')
   # Recupera a classificação dos vídeos anteriores à biblioteca por temas.
   # Não altera vídeos já classificados, arquivos ou links existentes.
   c.execute("INSERT INTO library_metadata(video_id,theme,description) SELECT v.id,'Outros','' FROM videos v LEFT JOIN library_metadata m ON m.video_id=v.id WHERE m.video_id IS NULL")
   c.execute("UPDATE library_metadata SET theme='Outros' WHERE theme IS NULL OR TRIM(theme)=''")
 ns['init']=init
 def identity(self):
  u=self.user()
  if not u or u.get('role') not in ('owner','viewer') or u.get('call_only') or u.get('call_room'):return None
  return u
 def list_rows(self,u):
  with db() as c:
   rows=[dict(r) for r in c.execute('SELECT v.*,m.theme,m.description,s.youtube_id,s.created_by FROM videos v LEFT JOIN library_metadata m ON m.video_id=v.id LEFT JOIN tv_library_sources s ON s.video_id=v.id ORDER BY v.created DESC')]
  result=[]
  for row in rows:
   if not self.allowed(u,row):continue
   item={k:v for k,v in row.items() if k not in ('created_by','allowed') and v is not None}
   item['theme']=normalize(row['theme']);item['can_edit_theme']=u['role']=='owner' or row['created_by']==u['id'];result.append(item)
  return result
 old_get=H.do_GET
 def get(self):
  path=urlparse(self.path).path
  assets={'/tv-library-form.js':('tv-library-form.js','text/javascript; charset=utf-8'),'/tv-library-form.css':('tv-library-form.css','text/css; charset=utf-8')}
  if path in assets:
   name,mime=assets[path]
   try:raw=(ROOT/'static'/name).read_bytes()
   except OSError:return self.reply(404)
   self.send_response(200);self.headers_common();self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw);return
  if path!='/api/tv-library':return old_get(self)
  u=identity(self)
  if not u:return self.reply(401,{'error':'Entre pelo seu acesso autorizado do Assistente FSJ.'})
  return self.reply(obj={'videos':list_rows(self,u),'themes':THEMES})
 H.do_GET=get
 old_post=H._do_POST
 def post(self):
  path=urlparse(self.path).path
  if not path.startswith('/api/tv-library/'):return old_post(self)
  origin=self.headers.get('Origin')
  if self.headers.get('X-FSJ-Request')!='1' or (origin and urlparse(origin).netloc!=self.headers.get('Host')):return self.reply(403,{'error':'Origem inválida.'})
  u=identity(self)
  if not u:return self.reply(401,{'error':'Entre pelo seu acesso autorizado do Assistente FSJ.'})
  try:
   if path=='/api/tv-library/upload':
    q=parse_qs(urlparse(self.path).query);topic=theme(q.get('theme',[''])[0]);inst=q.get('institutional',['0'])[0]=='1'
    if inst and u['role']!='owner':return self.reply(403,{'error':'Somente o Proprietário define o institucional.'})
    title=q.get('title',['Vídeo da biblioteca'])[0].strip();mime=self.headers.get('Content-Type','').split(';')[0];size=int(self.headers.get('Content-Length','0'))
    if not title or len(title)>160 or mime not in ('video/mp4','video/webm') or not 0<size<=ns['MAX']:raise ValueError('Selecione um vídeo MP4 ou WebM de até 500 MB.')
    ident=secrets.token_hex(16);temp=DATA/'videos'/(ident+'.part');target=DATA/'videos'/ident;committed=False
    try:
     with temp.open('xb') as f:
      left=size
      while left:
       chunk=self.rfile.read(min(left,1024*1024))
       if not chunk:raise ValueError('Envio interrompido.')
       f.write(chunk);left-=len(chunk)
      f.flush();os.fsync(f.fileno())
     with temp.open('rb') as f:magic=f.read(32)
     if not ((mime=='video/mp4' and magic[4:8]==b'ftyp') or (mime=='video/webm' and magic[:4]==b'\x1aE\xdf\xa3')):raise ValueError('Formato de vídeo inválido.')
     current=identity(self)
     if not current:return self.reply(401,{'error':'Acesso expirado durante o envio. Entre novamente.'})
     if inst and current['role']!='owner':return self.reply(403,{'error':'Somente o Proprietário define o institucional.'})
     temp.replace(target)
     with db() as c:
      if inst:c.execute('UPDATE videos SET institutional=0 WHERE institutional=1')
      c.execute('INSERT INTO videos(id,title,mime,size,institutional,allowed,created) VALUES(?,?,?,?,?,?,?)',(ident,title,mime,size,int(inst),'*',time.time()))
      c.execute('INSERT INTO library_metadata(video_id,theme,description) VALUES(?,?,?)',(ident,topic,''))
      c.execute('INSERT INTO tv_library_sources(video_id,created_by) VALUES(?,?)',(ident,u['id']))
      audit(c,u['id'],ident,'tv-library-upload')
     committed=True
    finally:
     temp.unlink(missing_ok=True)
     if not committed:target.unlink(missing_ok=True)
    return self.reply(201,{'ok':True,'id':ident})
   data=self.body()
   if path=='/api/tv-library/youtube':
    topic=theme(data.get('theme'));yt=youtube(data.get('url'));inst=data.get('institutional') is True
    if inst and u['role']!='owner':return self.reply(403,{'error':'Somente o Proprietário define o institucional.'})
    title=str(data.get('title') or 'Vídeo do YouTube').strip()
    if not title or len(title)>160:raise ValueError('Título inválido.')
    ident=secrets.token_hex(16)
    with db() as c:
     if inst:c.execute('UPDATE videos SET institutional=0 WHERE institutional=1')
     c.execute('INSERT INTO videos(id,title,mime,size,institutional,allowed,created) VALUES(?,?,?,?,?,?,?)',(ident,title,'text/youtube',0,int(inst),'*',time.time()))
     c.execute('INSERT INTO library_metadata(video_id,theme,description) VALUES(?,?,?)',(ident,topic,''))
     c.execute('INSERT INTO tv_library_sources(video_id,youtube_id,created_by) VALUES(?,?,?)',(ident,yt,u['id']))
     audit(c,u['id'],ident,'tv-library-youtube')
    return self.reply(201,{'ok':True,'id':ident})
   ident=str(data.get('id') or '')
   with db() as c:
    row=c.execute('SELECT v.*,s.created_by FROM videos v LEFT JOIN tv_library_sources s ON s.video_id=v.id WHERE v.id=?',(ident,)).fetchone()
    if not row or not self.allowed(u,row):return self.reply(404,{'error':'Vídeo indisponível.'})
    if path=='/api/tv-library/delete':
     if u['role']!='owner':return self.reply(403,{'error':'Somente o Proprietário pode excluir vídeos.'})
     if row['institutional']:return self.reply(409,{'error':'O vídeo institucional ativo está protegido.'})
     c.execute('DELETE FROM library_metadata WHERE video_id=?',(ident,))
     c.execute('DELETE FROM tv_library_sources WHERE video_id=?',(ident,))
     c.execute('DELETE FROM videos WHERE id=?',(ident,))
     audit(c,u['id'],ident,'tv-library-delete')
     # Não remover o arquivo físico enquanto a transação estiver aberta.
    elif path=='/api/tv-library/theme':
     topic=theme(data.get('theme'))
     if u['role']!='owner' and row['created_by']!=u['id']:return self.reply(403,{'error':'A alteração do tema cabe ao autor do envio ou ao Proprietário.'})
     c.execute('INSERT INTO library_metadata(video_id,theme,description) VALUES(?,?,?) ON CONFLICT(video_id) DO UPDATE SET theme=excluded.theme',(ident,topic,''))
     audit(c,u['id'],ident,'tv-library-theme')
    elif path=='/api/tv-library/institutional':
     if u['role']!='owner':return self.reply(403,{'error':'Somente o Proprietário define o institucional.'})
     c.execute('UPDATE videos SET institutional=0 WHERE institutional=1')
     c.execute("UPDATE videos SET institutional=1,allowed='*' WHERE id=?",(ident,))
     audit(c,u['id'],ident,'tv-library-institutional')
    else:return self.reply(404,{'error':'Ação inválida.'})
   if path=='/api/tv-library/delete' and row['mime']!='text/youtube':
    # A biblioteca usa o ID aleatório como nome do arquivo armazenado.
    (DATA/'videos'/ident).unlink(missing_ok=True)
   return self.reply(obj={'ok':True})
  except (ValueError,TypeError) as e:return self.reply(400,{'error':str(e)})
 H._do_POST=post
