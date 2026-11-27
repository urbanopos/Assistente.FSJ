import unittest,tempfile,sqlite3
from contextlib import contextmanager
from pathlib import Path
from library_videos import install,youtube_id

class LibraryTests(unittest.TestCase):
 def test_links(self):
  for url in ['https://youtu.be/abcdefghijk','https://www.youtube.com/watch?v=abcdefghijk','https://youtube.com/shorts/abcdefghijk']:
   self.assertEqual(youtube_id(url),'abcdefghijk')
  for url in ['http://youtu.be/abcdefghijk','https://youtube.com.evil.org/watch?v=abcdefghijk','javascript:alert(1)']:
   with self.assertRaises(ValueError):youtube_id(url)
 def test_permissions_and_persistence(self):
  with tempfile.TemporaryDirectory() as tmp:
   @contextmanager
   def db():
    c=sqlite3.connect(Path(tmp)/'db');c.row_factory=sqlite3.Row
    try:
     with c:yield c
    finally:c.close()
   def init():
    with db() as c:c.executescript('CREATE TABLE IF NOT EXISTS users(id TEXT,role TEXT,status TEXT);CREATE TABLE IF NOT EXISTS videos(id TEXT,title TEXT,mime TEXT,size INTEGER,institutional INTEGER,allowed TEXT,created REAL);')
   class Handler:
    def post(self):return 'original'
    def reply(self,status=200,obj=None):return status,obj
    def user(self):return self.identity
    def body(self):return self.data
   g={'init':init,'db':db,'Handler':Handler};install(g);g['init']();g['init']()
   h=Handler();h.path='/api/library/link';h.data={'title':'Poda','url':'https://youtu.be/abcdefghijk','theme':'Plantio','description':'Cuidados na poda','allowed':'*'}
   for identity,expected in [(None,401),({'role':'viewer'},403),({'role':'owner','call_only':True},401)]:
    h.identity=identity;self.assertEqual(h.post()[0],expected)
   h.identity={'role':'owner'};code,result=h.post();self.assertEqual(code,201)
   with db() as c:
    video=dict(c.execute('SELECT * FROM videos').fetchone());self.assertEqual(video['allowed'],'*')
   _,listing=h.reply(obj={'videos':[video]});self.assertEqual(listing['videos'][0]['theme'],'Plantio');self.assertEqual(listing['videos'][0]['youtube_id'],'abcdefghijk')
   h.path='/api/library/metadata';h.data={'id':result['id'],'theme':'Frutíferas','description':'Nova descrição'};self.assertEqual(h.post()[0],201)
   self.assertEqual(h.reply(obj={'videos':[video]})[1]['videos'][0]['youtube_id'],'abcdefghijk')
   h.path='/api/library/link';h.data={'title':'Inválido','url':'https://evil.org','allowed':'*'};self.assertEqual(h.post()[0],400)
   with db() as c:self.assertEqual(c.execute('SELECT COUNT(*) FROM videos').fetchone()[0],1)

if __name__=='__main__':unittest.main()
