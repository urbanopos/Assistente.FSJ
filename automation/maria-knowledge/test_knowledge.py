import importlib.util,json,tempfile,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('knowledge',Path(__file__).with_name('install.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class KnowledgeTests(unittest.TestCase):
 def test_current_base_permissions_and_no_operational_writes(self):
  with tempfile.TemporaryDirectory() as temp:
   source=Path(temp)/'code';root=Path(temp)/'private';(source/'docs').mkdir(parents=True)
   (source/m.DOCUMENTS[0]).write_text('# Manual\nEstado: planejado.')
   (source/'dados.db').write_text('preservar');(source/'.env').write_text('SENTINEL_SECRET=nao_copiar')
   m.refresh(source,root);data=json.loads((root/'knowledge.json').read_text())
   self.assertEqual(data['documents'][0]['state'],'disponivel');self.assertIn('planejado',data['documents'][0]['text'])
   self.assertNotIn('SENTINEL_SECRET',(root/'knowledge.json').read_text());self.assertEqual((source/'dados.db').read_text(),'preservar')
   self.assertFalse(data['capabilities']['chat_connected']);self.assertFalse(data['facts']['remote_currently_checked'])
   self.assertEqual((root.stat().st_mode & 0o777),0o700);self.assertEqual(((root/'knowledge.json').stat().st_mode & 0o777),0o600)
   m.refresh(source,root);self.assertTrue((root/'knowledge.previous.json').is_file())
   before=(root/'knowledge.json').read_bytes();(source/m.DOCUMENTS[0]).unlink()
   with self.assertRaises(ValueError):m.refresh(source,root)
   self.assertEqual((root/'knowledge.json').read_bytes(),before)
 def test_symlink_destination_refused(self):
  with tempfile.TemporaryDirectory() as temp:
   base=Path(temp);(base/'actual').mkdir();(base/'link').symlink_to(base/'actual',target_is_directory=True)
   with self.assertRaises(ValueError):m.refresh(base,base/'link')
if __name__=='__main__':unittest.main()
