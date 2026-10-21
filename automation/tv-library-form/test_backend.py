import contextlib,importlib.util,json,sqlite3,tempfile,threading,unittest,urllib.request,urllib.error
from pathlib import Path
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
spec=importlib.util.spec_from_file_location('tv_library_form',Path(__file__).with_name('tv_library_form.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class LibraryTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.tmp=tempfile.TemporaryDirectory();cls.root=Path(cls.tmp.name);(cls.root/'videos').mkdir();(cls.root/'static').mkdir();(cls.root/'static/tv-library-form.js').write_text('/* FSJ_TV_LIBRARY_FORM_V1 */')
  @contextlib.contextmanager
  def db():
   c=sqlite3.connect(cls.root/'test.sqlite');c.row_factory=sqlite3.Row
   try:
    with c:yield c
   finally:c.close()
  cls.db=staticmethod(db)
  def init():
   with db() as c:c.executescript('CREATE TABLE videos(id TEXT PRIMARY KEY,title TEXT,mime TEXT,size INTEGER,institutional INTEGER,allowed TEXT,created REAL);CREATE TABLE audit(actor TEXT,target TEXT,action TEXT)')
  class H(BaseHTTPRequestHandler):
   def log_message(self,*a):pass
   def headers_common(self):self.send_header('Cache-Control','no-store')
   def user(self):
    who=self.headers.get('Test-User');return None if not who else {'id':who,'role':'owner' if who=='owner' else 'viewer','call_only':who=='call'}
   def allowed(self,u,v):return u['role']=='owner' or v['allowed']=='*' or u['id'] in v['allowed'].split(',')
   def reply(self,status=200,obj=None):
    b=json.dumps(obj or {}).encode();self.send_response(status);self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
   def body(self):return json.loads(self.rfile.read(int(self.headers.get('Content-Length','0'))))
   def do_GET(self):return self.reply(404)
   def _do_POST(self):return self.reply(404)
   def do_POST(self):return self._do_POST()
  ns={'Handler':H,'db':db,'DATA':cls.root,'ROOT':cls.root,'audit':lambda c,u,v,a:c.execute('INSERT INTO audit VALUES(?,?,?)',(u,v,a)),'init':init,'MAX':500*1024*1024};module.install(ns);ns['init']()
  cls.http=ThreadingHTTPServer(('127.0.0.1',0),H);cls.thread=threading.Thread(target=cls.http.serve_forever,daemon=True);cls.thread.start();cls.base='http://127.0.0.1:'+str(cls.http.server_port)
 @classmethod
 def tearDownClass(cls):cls.http.shutdown();cls.http.server_close();cls.tmp.cleanup()
 def request(self,path,data=None,user='viewer',raw=None,headers=None):
  h={'X-FSJ-Request':'1','Content-Type':'application/json',**(headers or {})}
  if user:h['Test-User']=user
  body=raw if raw is not None else json.dumps(data).encode() if data is not None else None
  try:
   with urllib.request.urlopen(urllib.request.Request(self.base+path,data=body,headers=h),timeout=3) as r:return r.status,json.load(r)
  except urllib.error.HTTPError as e:return e.code,json.load(e)
 def test_theme_required_and_no_anonymous_or_call_session(self):
  for user in (None,'call'):self.assertEqual(self.request('/api/tv-library',user=user)[0],401)
  self.assertEqual(self.request('/api/tv-library/youtube',{'url':'https://youtu.be/abcdefghijk'})[0],400)
  self.assertEqual(self.request('/api/tv-library/youtube',{'url':'https://evil.example/abcdefghijk','theme':'Campo'})[0],400)
 def test_upload_theme_edit_keeps_file_and_permissions(self):
  raw=b'\x00\x00\x00\x20ftypisom' + b'0'*20
  code,result=self.request('/api/tv-library/upload?theme=Campo&title=Teste',raw=raw,headers={'Content-Type':'video/mp4'})
  self.assertEqual(code,201);ident=result['id'];before=(self.root/'videos'/ident).read_bytes()
  self.assertEqual(self.request('/api/tv-library/theme',{'id':ident,'theme':'Aviário'},user='other')[0],403)
  self.assertEqual(self.request('/api/tv-library/theme',{'id':ident,'theme':'Aviário'})[0],200)
  self.assertEqual((self.root/'videos'/ident).read_bytes(),before)
  rows=self.request('/api/tv-library')[1]['videos'];self.assertEqual(next(v for v in rows if v['id']==ident)['theme'],'Aviário')
 def test_institutional_is_owner_only(self):
  payload={'url':'https://www.youtube.com/watch?v=abcdefghijk','theme':'Outros','institutional':True}
  self.assertEqual(self.request('/api/tv-library/youtube',payload)[0],403)
  code,result=self.request('/api/tv-library/youtube',{**payload,'institutional':False});self.assertEqual(code,201)
  ident=result['id'];self.assertEqual(self.request('/api/tv-library/institutional',{'id':ident})[0],403)
  self.assertEqual(self.request('/api/tv-library/institutional',{'id':ident},user='owner')[0],200)
  self.assertEqual(next(v for v in self.request('/api/tv-library')[1]['videos'] if v['id']==ident)['youtube_id'],'abcdefghijk')
 def test_public_assets_and_path_boundary(self):
  with urllib.request.urlopen(self.base+'/tv-library-form.js?v=1') as r:
   self.assertIn('javascript',r.headers['Content-Type']);self.assertIn(b'FSJ_TV_LIBRARY_FORM_V1',r.read())
  self.assertEqual(self.request('/tv-library-form.js/../dados/fsj.sqlite')[0],404)
 def test_csrf_rejected(self):
  self.assertEqual(self.request('/api/tv-library/youtube',{'url':'https://youtu.be/abcdefghijk','theme':'Campo'},headers={'Origin':'https://evil.example'})[0],403)
if __name__=='__main__':unittest.main()
