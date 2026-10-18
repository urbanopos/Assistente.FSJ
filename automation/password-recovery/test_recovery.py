import importlib.util, pathlib, shutil, sys, tempfile, threading, unittest, json, http.client, secrets, time

HERE=pathlib.Path(__file__).resolve().parent

class RecoveryTest(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  source=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 and pathlib.Path(sys.argv[1]).is_dir() else None
  if source is None: raise unittest.SkipTest('Informe a pasta com server.py, calls.py e static/.')
  cls.temp=tempfile.TemporaryDirectory();cls.root=pathlib.Path(cls.temp.name)
  shutil.copytree(source,cls.root,dirs_exist_ok=True)
  spec=importlib.util.spec_from_file_location('recovery_installer',HERE/'install-vm.py');installer=importlib.util.module_from_spec(spec);spec.loader.exec_module(installer)
  installer.install(cls.root,False);installer.install(cls.root,False)
  sys.path.insert(0,str(cls.root))
  import server, recovery
  cls.s=server;cls.r=recovery;server.init()
  with server.db() as c:
   for name,role,status in [('urbano','owner','active'),('regina','viewer','active'),('bloqueada','viewer','blocked')]:
    salt=secrets.token_hex(16)
    c.execute('INSERT INTO users(id,name,hash,salt,role,status,display_name) VALUES(?,?,?,?,?,?,?)',(name,name,server.password_hash('SenhaAnterior123',salt),salt,role,status,name))
  server.SESSIONS['owner-test']=('urbano',time.time()+1000)
  server.SESSIONS['regina-test']=('regina',time.time()+1000)
  cls.secret=recovery.configure(server)[1]['secret']
  cls.http=server.ThreadingHTTPServer(('127.0.0.1',0),server.Handler)
  threading.Thread(target=cls.http.serve_forever,daemon=True).start()
 @classmethod
 def tearDownClass(cls):cls.http.shutdown();cls.temp.cleanup()
 def post(self,action,data={},owner=False,worker=False):
  headers={'Content-Type':'application/json','X-FSJ-Request':'1'}
  if owner:headers['Cookie']='fsj_session=owner-test'
  if worker:headers['Authorization']='Bearer '+self.secret
  c=http.client.HTTPConnection('127.0.0.1',self.http.server_port)
  c.request('POST','/api/password-recovery/'+action,json.dumps(data),headers)
  r=c.getresponse();result=(r.status,json.loads(r.read()));c.close();return result
 def test_complete_flow(self):
  self.assertEqual(self.post('owner/phone',{'id':'regina','phone':'81900000001'})[0],403)
  self.assertEqual(self.post('owner/phone',{'id':'regina','phone':'abc'},owner=True)[0],400)
  self.assertEqual(self.post('owner/phone',{'id':'regina','phone':'81900000001'},owner=True)[0],200)
  self.assertEqual(self.post('worker/claim')[0],403)
  self.assertEqual(self.post('worker/ping',worker=True)[0],200)
  status,requested=self.post('request',{'name':'regina'});self.assertEqual(status,200);self.assertEqual(requested['expires_in'],300)
  self.assertEqual(self.post('request',{'name':'regina'})[1]['request'],requested['request'])
  job=self.post('worker/claim',worker=True)[1]['job'];self.assertEqual(job['id'],requested['request'])
  self.assertEqual(len(job['code']),6);self.assertAlmostEqual(job['expires']-time.time(),300,delta=3)
  self.assertIsNone(self.post('worker/claim',worker=True)[1]['job'])
  payload={'request':job['id'],'code':job['code'],'password':'SenhaNova12345','confirmation':'SenhaNova12345'}
  self.assertEqual(self.post('reset',payload)[0],400) # entrega ainda nao confirmada
  self.post('worker/ack',{'id':job['id'],'lease':'wrong','sent':True},worker=True)
  self.assertEqual(self.post('reset',payload)[0],400)
  self.post('worker/ack',{'id':job['id'],'lease':job['lease'],'sent':True},worker=True)
  with self.r.database(self.s) as c:self.assertIsNone(c.execute('SELECT code FROM requests WHERE id=?',(job['id'],)).fetchone()[0])
  self.assertEqual(self.post('reset',{**payload,'confirmation':'OutraSenha123'})[0],400)
  self.assertEqual(self.post('reset',{**payload,'code':str((int(job['code'])+1)%1000000).zfill(6)})[0],400)
  self.assertEqual(self.post('reset',payload)[0],200)
  self.assertNotIn('regina-test',self.s.SESSIONS)
  self.assertEqual(self.post('reset',payload)[0],400)
  with self.s.db() as c:
   user=c.execute('SELECT * FROM users WHERE id=?',('regina',)).fetchone()
   self.assertEqual(user['hash'],self.s.password_hash('SenhaNova12345',user['salt']))
   self.assertEqual(c.execute('SELECT COUNT(*) FROM users').fetchone()[0],3)
  # Pedidos desconhecidos nao revelam a existencia de contas.
  self.assertEqual(self.post('request',{'name':'inexistente'})[0],200)
  self.assertEqual(self.post('request',{'name':'bloqueada'})[0],200)
  self.assertIsNone(self.post('worker/claim',worker=True)[1]['job'])
  # Simular novos pedidos sem enviar mensagens reais.
  for case in ('expirado','limite','bloqueado'):
   rid=secrets.token_urlsafe(24);code='123456'
   with self.r.database(self.s) as c:
    c.execute("INSERT INTO requests(id,uid,phone,code,hash,created,expires,status,attempts) VALUES(?,?,?,?,?,?,?,'sent',?)",
     (rid,'regina','5581900000001',None,self.r.code_hash(self.secret,rid,code),time.time(),time.time()+(-1 if case=='expirado' else 300),5 if case=='limite' else 0))
   if case=='bloqueado':
    with self.s.db() as c:c.execute("UPDATE users SET status='blocked' WHERE id='regina'")
   self.assertEqual(self.post('reset',{**payload,'request':rid,'code':code})[0],400)

if __name__=='__main__':
 source=sys.argv[1] if len(sys.argv)>1 else ''
 # Preservar o caminho para setUpClass sem passa-lo ao parser do unittest.
 suite=unittest.defaultTestLoader.loadTestsFromTestCase(RecoveryTest)
 result=unittest.TextTestRunner(verbosity=2).run(suite)
 raise SystemExit(not result.wasSuccessful())
