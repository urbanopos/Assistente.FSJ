import importlib.util,sys,types,tempfile,shutil,ssl,threading,http.client,json,base64,time,subprocess,unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
class TestSSO(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.temp=Path(tempfile.mkdtemp(prefix='fsj-sso-test-'));cls.root=cls.temp/'app';shutil.copytree('/tmp/fsj-sso-patched',cls.root)
  shutil.copy2('fsj-sso-current/calls.py',cls.root/'calls.py');sys.path.insert(0,str(cls.root));sys.path.insert(0,str(HERE))
  lib=types.ModuleType('library_videos');lib.install=lambda *a:None;lib.metadata=lambda *a:{};sys.modules['library_videos']=lib
  device=types.ModuleType('device_calls');device.guard=lambda server,token,user:user;sys.modules['device_calls']=device
  spec=importlib.util.spec_from_file_location('sso_test_server',cls.root/'server.py');cls.server=importlib.util.module_from_spec(spec);sys.modules[spec.name]=cls.server;spec.loader.exec_module(cls.server)
  cls.server.init();cls.server.adduser('urbano','senha-teste-12345','owner')
  import fsj_sso;cls.sso=fsj_sso
  cls.allowed=True;cls.auth_calls=[]
  def remote(path,token):
   cls.auth_calls.append(path)
   if token!=cls.jwt:raise fsj_sso.SSOError(401,'Sessão inválida.')
   if path=='/auth/v1/user':return {'id':'central-owner','email_confirmed_at':'2026-01-01T00:00:00Z'}
   return [{'auth_user_id':'central-owner'}] if cls.allowed else []
  cls.sso.request=remote
  encode=lambda obj:base64.urlsafe_b64encode(json.dumps(obj).encode()).decode().rstrip('=')
  cls.jwt=encode({'alg':'TEST'})+'.'+encode({'sub':'central-owner','exp':time.time()+3600})+'.'+'a'*50
  key=cls.temp/'key.pem';cert=cls.temp/'cert.pem';subprocess.run(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-keyout',str(key),'-out',str(cert),'-days','1','-subj','/CN=localhost','-addext','subjectAltName=IP:127.0.0.1'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  cls.http=cls.server.ThreadingHTTPServer(('127.0.0.1',0),cls.server.Handler);ctx=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);ctx.load_cert_chain(cert,key);cls.http.socket=ctx.wrap_socket(cls.http.socket,server_side=True);cls.port=cls.http.server_port;cls.context=ssl.create_default_context(cafile=cert)
  cls.thread=threading.Thread(target=cls.http.serve_forever,daemon=True);cls.thread.start()
 @classmethod
 def tearDownClass(cls):cls.http.shutdown();cls.http.server_close();shutil.rmtree(cls.temp)
 def setUp(self):self.__class__.allowed=True;self.sso.AUTH.clear();self.server.SESSIONS.clear();self.server.ATTEMPTS.clear()
 def request(self,path,body=None,cookie=None,origin=None):
  conn=http.client.HTTPSConnection('127.0.0.1',self.port,context=self.context)
  headers={};method='GET'
  if cookie:headers['Cookie']=cookie
  if body is not None:method='POST';headers.update({'X-FSJ-Request':'1','Content-Type':'application/json','Origin':origin or 'https://127.0.0.1:'+str(self.port)});body=json.dumps(body)
  conn.request(method,path,body,headers);r=conn.getresponse();payload=r.read();result=(r.status,dict(r.getheaders()),payload);conn.close();return result
 def exchange(self):
  code,headers,raw=self.request('/api/sso/exchange',{'access_token':self.jwt});self.assertEqual(code,200,raw);return headers['Set-Cookie'].split(';')[0],headers
 def test_allowed_and_cookie_security(self):
  cookie,h=self.exchange()
  for attribute in ['HttpOnly','Secure','SameSite=None','Partitioned','Path=/']:self.assertIn(attribute,h['Set-Cookie'])
  code,_,raw=self.request('/api/me',cookie=cookie);u=json.loads(raw);self.assertEqual(code,200);self.assertEqual(u['role'],'owner');self.assertTrue(u['sso']);self.assertNotIn('access_token',u)
 def test_no_permission_not_granted_by_email(self):
  self.__class__.allowed=False;code,_,_=self.request('/api/sso/exchange',{'access_token':self.jwt,'role':'owner','name':'urbano'});self.assertEqual(code,403);self.assertFalse(self.server.SESSIONS)
 def test_invalid_token(self):self.assertEqual(self.request('/api/sso/exchange',{'access_token':'a'*100})[0],401)
 def test_cross_origin_post(self):self.assertEqual(self.request('/api/sso/exchange',{'access_token':self.jwt},origin='https://evil.invalid')[0],403)
 def test_central_revocation(self):
  cookie,_=self.exchange();token=cookie.split('=',1)[1];self.sso.AUTH[token]['checked']=0;self.__class__.allowed=False;self.assertEqual(self.request('/api/me',cookie=cookie)[0],401);self.assertNotIn(token,self.server.SESSIONS)
 def test_expired_session(self):
  cookie,_=self.exchange();self.sso.AUTH[cookie.split('=',1)[1]]['expires']=0;self.assertEqual(self.request('/api/me',cookie=cookie)[0],401)
 def test_logout_does_not_revoke_native_login(self):
  with self.server.db() as c:uid=c.execute("select id from users where role='owner'").fetchone()['id']
  self.server.SESSIONS['normal']=(uid,time.time()+1000)
  cookie,_=self.exchange();self.assertEqual(self.request('/api/sso/logout',{},cookie=cookie)[0],200);self.assertIn('normal',self.server.SESSIONS);self.assertEqual(self.request('/api/me',cookie=cookie)[0],401)
 def test_static_headers_and_bootstrap(self):
  code,headers,raw=self.request('/');self.assertEqual(code,200);self.assertIn(b'/sso-bridge.js',raw);self.assertIn("img-src 'self' data:",headers['Content-Security-Policy']);self.assertNotIn("script-src 'self' 'unsafe-inline'",headers['Content-Security-Policy'])
  self.assertEqual(self.request('/sso-bridge.js')[0],200)
 def test_no_active_local_owner(self):
  with self.server.db() as c:c.execute("update users set status='blocked' where role='owner'")
  try:self.assertEqual(self.request('/api/sso/exchange',{'access_token':self.jwt})[0],403)
  finally:
   with self.server.db() as c:c.execute("update users set status='active' where role='owner'")
if __name__=='__main__':unittest.main()
