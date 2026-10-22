import importlib.util,json,sqlite3,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('updater',Path(__file__).with_name('update-library.py'));updater=importlib.util.module_from_spec(spec);spec.loader.exec_module(updater)
class InstallerTests(unittest.TestCase):
 def fixture(self):
  tmp=tempfile.TemporaryDirectory();root=Path(tmp.name);(root/'static').mkdir();(root/'dados').mkdir()
  (root/'static/tv-library-form.js').write_text((Path(__file__).parent/'fixtures/form-before-names.js').read_text())
  (root/'tv_library_form.py').write_text((Path(__file__).parent/'fixtures/module-before-names.py').read_text())
  (root/'static/index.html').write_text('<script src="/tv-library-form.js?v=previous"></script><p>Outras telas preservadas</p>')
  (root/'version.json').write_text(json.dumps({'release':9,'android_version':14,'web_version':'old'}))
  with sqlite3.connect(root/'dados/fsj.sqlite') as c:
   c.executescript("CREATE TABLE videos(id TEXT PRIMARY KEY,title TEXT);CREATE TABLE library_metadata(video_id TEXT PRIMARY KEY,theme TEXT,description TEXT);CREATE TABLE users(id TEXT,name TEXT);INSERT INTO users VALUES('owner','Proprietário');")
   c.executemany('INSERT INTO videos VALUES(?,?)',[(x,'Vídeo '+x) for x in 'abcde'])
   c.executemany('INSERT INTO library_metadata VALUES(?,?,?)',[('b','','Descrição preservada'),('c','Campo','Classificado'),('d','Sem tema','Antigo'),('e','Aves','Alias antigo')])
  return tmp,root
 def rows(self,root):
  with sqlite3.connect(root/'dados/fsj.sqlite') as c:return c.execute('SELECT * FROM library_metadata ORDER BY video_id').fetchall()
 def test_legacy_migration_backup_and_idempotence(self):
  tmp,root=self.fixture()
  with tmp:
   previous=self.rows(root);backup,count=updater.apply(root,check_health=False)
   self.assertEqual(count,3)
   self.assertEqual(self.rows(root),[('a','Outros',''),('b','Outros','Descrição preservada'),('c','Campo','Classificado'),('d','Outros','Antigo'),('e','Aves','Alias antigo')])
   with sqlite3.connect(backup/'fsj.sqlite') as c:self.assertEqual(c.execute('SELECT * FROM library_metadata ORDER BY video_id').fetchall(),previous)
   with sqlite3.connect(root/'dados/fsj.sqlite') as c:
    self.assertEqual(c.execute('SELECT count(*) FROM videos').fetchone()[0],5)
    self.assertEqual(c.execute('SELECT name FROM users').fetchone()[0],'Proprietário')
   self.assertEqual(json.loads((root/'version.json').read_text())['android_version'],14)
   self.assertIn('Outras telas preservadas',(root/'static/index.html').read_text())
   self.assertIn('/api/tv-library/delete',(root/'tv_library_form.py').read_text())
   self.assertIsNone(updater.apply(root,check_health=False))
 def test_unknown_code_is_not_overwritten(self):
  tmp,root=self.fixture()
  with tmp:
   file=root/'static/tv-library-form.js';file.write_text('custom change')
   before=self.rows(root)
   with self.assertRaises(ValueError):updater.apply(root,check_health=False)
   self.assertEqual(file.read_text(),'custom change');self.assertEqual(self.rows(root),before)
 def test_partial_file_failure_restores_files_and_database(self):
  tmp,root=self.fixture()
  with tmp:
   file=root/'static/tv-library-form.js';before=file.read_text();rows=self.rows(root);real=updater.atomic
   def fail(target,text):
    if target.name=='tv_library_form.py':raise RuntimeError('simulated write failure')
    return real(target,text)
   with patch.object(updater,'atomic',side_effect=fail):
    with self.assertRaises(RuntimeError):updater.apply(root,check_health=False)
   self.assertEqual(file.read_text(),before);self.assertEqual(self.rows(root),rows)
   self.assertFalse((root/'dados/updates/applying').exists())
if __name__=='__main__':unittest.main()

