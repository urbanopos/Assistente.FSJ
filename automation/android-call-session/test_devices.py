import sys,pathlib,json,http.client,threading,time,unittest,secrets
sys.path.insert(0,sys.argv[1])
import server as s,device_calls as d
s.mirror_account_allowed=lambda u: True

class Devices(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  s.init()
  with s.db() as c:
   for uid,role in [('owner','owner'),('regina','viewer'),('outro','viewer')]:
    salt=secrets.token_hex(16);c.execute('INSERT OR REPLACE INTO users(id,name,hash,salt,role,status,display_name) VALUES(?,?,?,?,?,?,?)',(uid,uid,s.password_hash('SenhaTeste1234',salt),salt,role,'active',uid))
  s.SESSIONS['regina-ui']=('regina',time.time()+1000)
  cls.http=s.ThreadingHTTPServer(('127.0.0.1',0),s.Handler);threading.Thread(target=cls.http.serve_forever,daemon=True).start()
 @classmethod
 def tearDownClass(cls):cls.http.shutdown()
 def req(self,path,data=None,cookie=None,bearer=None):
  h={'X-FSJ-Request':'1','Content-Type':'application/json'}
  if cookie:h['Cookie']='fsj_session='+cookie
  if bearer:h['Authorization']='Bearer '+bearer
  conn=http.client.HTTPConnection('127.0.0.1',self.http.server_port);conn.request('POST' if data is not None else 'GET',path,json.dumps(data) if data is not None else None,h);r=conn.getresponse();result=(r.status,json.loads(r.read()),dict(r.getheaders()));conn.close();return result
 def test_lifecycle(self):
  prefix='/api/device-calls/'
  self.assertEqual(self.req(prefix+'bind',{})[0],403)
  token=self.req(prefix+'bind',{},cookie='regina-ui')[1]['token']
  self.assertEqual(self.req(prefix+'poll',{},bearer='wrong')[0],401)
  self.req(prefix+'logout',{},cookie='regina-ui');self.assertNotIn('regina-ui',s.SESSIONS)
  self.assertEqual(self.req(prefix+'poll',{},bearer=token)[0],200)
  owner={'id':'owner','role':'owner','name':'owner','display_name':'owner'}
  room=s.CALLS.post(owner,'create',{'title':'Teste','mode':'video','participants':['regina']})['call']['id'];s.CALLS.post(owner,'join',{'room':room})
  self.assertEqual(self.req(prefix+'answer',{'room':room},bearer=token)[0],200)
  result=self.req(prefix+'answer',{'room':room},bearer=token)
  cookie=result[2]['Set-Cookie'].split(';')[0].split('=',1)[1]
  self.assertTrue(self.req('/api/me',cookie=cookie)[1]['call_only'])
  for path in ['/api/users','/api/mirror','/api/videos']:
   self.assertEqual(self.req(path,cookie=cookie)[0],403)
  self.assertEqual(self.req(prefix+'bind',{},cookie=cookie)[0],403)
  self.assertEqual(self.req('/api/calls/create',{'participants':['outro']},cookie=cookie)[0],403)
  self.assertEqual(self.req('/api/calls/join',{'room':'wrong'},cookie=cookie)[0],403)
  joined=self.req('/api/calls/join',{'room':room},cookie=cookie);self.assertEqual(joined[0],200)
  self.req('/api/calls/leave',{'room':room,'nonce':joined[1]['nonce']},cookie=cookie)
  self.req(prefix+'dismiss',{'room':room},bearer=token)
  self.req(prefix+'logout',{},cookie=cookie)
  self.assertEqual(self.req('/api/me',cookie=cookie)[0],401)
  self.assertEqual(self.req(prefix+'poll',{},bearer=token)[1]['calls'],[]) # nao toca novamente a chamada encerrada
  s.CALLS.post(owner,'end',{'room':room})
  room=s.CALLS.post(owner,'create',{'title':'Segunda','mode':'audio','participants':['regina']})['call']['id'];s.CALLS.post(owner,'join',{'room':room})
  self.assertEqual(len(self.req(prefix+'poll',{},bearer=token)[1]['calls']),1)
  response=self.req(prefix+'answer',{'room':room},bearer=token);cookie=response[2]['Set-Cookie'].split(';')[0].split('=',1)[1]
  s.CALLS.post(owner,'end',{'room':room});self.assertEqual(self.req('/api/me',cookie=cookie)[0],401)
  with s.db() as c:c.execute("UPDATE users SET status='blocked' WHERE id='regina'")
  self.assertEqual(self.req(prefix+'poll',{},bearer=token)[0],401)
  with s.db() as c:c.execute("UPDATE users SET status='active',hash='changed' WHERE id='regina'")
  self.assertEqual(self.req(prefix+'poll',{},bearer=token)[0],401)

if __name__=='__main__':
 result=unittest.TextTestRunner(verbosity=2).run(unittest.defaultTestLoader.loadTestsFromTestCase(Devices));raise SystemExit(not result.wasSuccessful())
