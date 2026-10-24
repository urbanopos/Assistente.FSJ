import importlib.util,unittest
from unittest.mock import patch
from pathlib import Path
spec=importlib.util.spec_from_file_location('bridge',Path(__file__).with_name('maria_bridge.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class BridgeTests(unittest.TestCase):
 def setUp(self):self.data={'checked_at':'2026-10-24T00:00:00+00:00','rules':{'improvements':'Procure Brisa no ChatGPT.','maintenance':'Não executa manutenção.','storage':'O código não é backup do banco.'},'facts':{'memory':{'MemTotal_kib':2097152,'MemAvailable_kib':1048576},'disk_free_bytes':27*1024**3,'local_commit':'local-123','origin_main_last_fetched':'origin-123','services':{'fsj-reserva.service':{'ActiveState':'active'}}}}
 def test_facts_and_no_false_remote_verification(self):
  a=m.answer('qual memória e espaço?',self.data);self.assertIn('2.0 GiB',a);self.assertIn('27.0 GiB',a)
  self.assertIn('Não consultei a versão atual do GitHub',m.answer('está atualizado?',self.data))
 def test_limits_and_unknown(self):
  self.assertIn('Brisa',m.answer('nova facilidade',self.data));self.assertIn('não executa correções',m.answer('corrigir erro',self.data))
  self.assertIn('Não identifiquei',m.answer('quanto custa uma bicicleta',self.data));self.assertIn('não fazem parte',m.answer('qual senha',self.data))
 def test_existing_routes_preserved(self):
  calls=[]
  class Handler:
   def do_GET(self):calls.append('get')
   def do_POST(self):calls.append('post')
   def headers_common(self):calls.append('headers')
  m.install({'Handler':Handler});h=Handler();h.path='/api/other';h.do_GET();h.do_POST();self.assertEqual(calls,['get','post'])
  before=Handler.do_GET;m.install({'Handler':Handler});self.assertIs(Handler.do_GET,before)
 def test_unauthenticated_and_wrong_origin_rejected_before_base_read(self):
  class TLS:pass
  class Handler:
   def do_GET(self):raise AssertionError('original')
   def do_POST(self):raise AssertionError('original')
   def headers_common(self):pass
   def reply(self,status=200,obj=None):return status,obj
  m.install({'Handler':Handler,'throttle':lambda *a:True})
  h=Handler();h.path='/api/maria/status';h.connection=TLS();h.client_address=('127.0.0.1',1);h.command='GET';h.headers={}
  with patch.object(m.ssl,'SSLSocket',TLS):
   self.assertEqual(h.do_GET()[0],401)
   h.headers={'Origin':'https://untrusted.example','Authorization':'Bearer never-validate'}
   self.assertEqual(h.do_GET()[0],403)
if __name__=='__main__':unittest.main()
