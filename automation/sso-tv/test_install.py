import unittest,tempfile,shutil,sys,importlib.util,subprocess
from pathlib import Path
from unittest.mock import patch
HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('sso_installer',HERE/'install.py');installer=importlib.util.module_from_spec(spec);spec.loader.exec_module(installer)
class TestInstall(unittest.TestCase):
 def setUp(self):self.temp=Path(tempfile.mkdtemp(prefix='fsj-sso-install-'));self.base=self.temp/'app';shutil.copytree('fsj-sso-current',self.base);self.before={n:(self.base/n).read_bytes() for n in installer.EXPECTED}
 def tearDown(self):shutil.rmtree(self.temp)
 def test_install_and_repeat(self):
  with patch.object(sys,'argv',['install.py',str(self.base)]),patch.object(installer,'health',return_value={'busy':False}),patch.object(installer.subprocess,'run'):
   installer.main();installer.main()
  self.assertIn('FSJ_SSO_TV_V1',(self.base/'server.py').read_text());self.assertTrue((self.base/'fsj_sso.py').exists());self.assertFalse((self.base/'dados/updates/applying').exists())
  self.assertEqual(len(list((self.base/'backups').iterdir())),1)
 def test_restart_failure_rolls_back(self):
  with patch.object(sys,'argv',['install.py',str(self.base)]),patch.object(installer,'health',return_value={'busy':False}),patch.object(installer.subprocess,'run',side_effect=[subprocess.CalledProcessError(1,'restart'),None]):
   with self.assertRaises(subprocess.CalledProcessError):installer.main()
  for name,content in self.before.items():self.assertEqual((self.base/name).read_bytes(),content)
  self.assertFalse((self.base/'fsj_sso.py').exists());self.assertFalse((self.base/'static/sso-bridge.js').exists());self.assertFalse((self.base/'dados/updates/applying').exists())
 def test_active_call_not_interrupted(self):
  with patch.object(sys,'argv',['install.py',str(self.base)]),patch.object(installer,'health',return_value={'busy':True}):
   with self.assertRaises(SystemExit):installer.main()
  self.assertEqual((self.base/'server.py').read_bytes(),self.before['server.py']);self.assertFalse((self.base/'backups').exists())
 def test_different_source_not_overwritten(self):
  p=self.base/'server.py';p.write_text(p.read_text()+'\n# edição posterior\n')
  with self.assertRaises(SystemExit):installer.prepare(self.base)
if __name__=='__main__':unittest.main()
