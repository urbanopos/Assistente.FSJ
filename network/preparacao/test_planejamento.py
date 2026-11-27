import tempfile,unittest,json
from pathlib import Path
from planejar_rede import generate
class PlanTests(unittest.TestCase):
 def test_private_files_and_matching_secret(self):
  with tempfile.TemporaryDirectory() as d:
   out=generate('8.8.4.4','192.168.77.2',Path(d)/'plan');cfg=json.loads((out/'rede.json').read_text());self.assertEqual(cfg['turn_host'],'8.8.4.4');self.assertIn('static-auth-secret='+cfg['turn_secret'],(out/'turnserver.conf').read_text());self.assertEqual(out.stat().st_mode&0o777,0o700)
   for file in out.iterdir():self.assertEqual(file.stat().st_mode&0o777,0o600)
   with self.assertRaises(ValueError):generate('8.8.4.4','192.168.77.2',out)
 def test_private_and_cgnat_are_not_public(self):
  for address in ['100.64.1.1','192.168.1.114','127.0.0.1']:
   with tempfile.TemporaryDirectory() as d:
    out=Path(d)/'plan'
    with self.assertRaises(ValueError):generate(address,'192.168.77.2',out)
    self.assertFalse(out.exists())
if __name__=='__main__':unittest.main()
