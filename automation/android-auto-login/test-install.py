import importlib.util,tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('installer',Path(__file__).with_name('install.py'));mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
with tempfile.TemporaryDirectory() as tmp:
 root=Path(tmp);(root/'static').mkdir();app=root/'static/app.js';original='// loginForm fsj:session\n';app.write_text(original)
 mod.install(root);new=app.read_text();assert new.startswith(original);assert new.count('/* FSJ_AUTO_LOGIN_V1 */')==1;assert len(list((root/'backups').iterdir()))==1
 mod.install(root);assert app.read_text()==new;assert len(list((root/'backups').iterdir()))==1
 print('PASS: instalacao incremental, backup e repeticao sem duplicacao.')
