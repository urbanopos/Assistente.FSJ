#!/usr/bin/env python3
"""Atualização conservadora: nomes, lista sem repetição e legado em Outros."""
from pathlib import Path
import base64,datetime,hashlib,json,os,re,shutil,sqlite3,ssl,subprocess,sys,time,urllib.request,uuid,zlib
PAYLOAD={} # generated
KNOWN_JS=set()
KNOWN_MODULE=set()
MARK='FSJ_TV_LIBRARY_NAMED_VIDEOS_V2'
def health(root):
 ca=root/'dados/tls/fsj-ca.crt'
 with urllib.request.urlopen('https://127.0.0.1:8443/api/version',context=ssl.create_default_context(cafile=str(ca)),timeout=10) as response:
  if json.load(response).get('busy'):raise ValueError('Há um envio/atualização em curso. Tente ao terminar.')
def prepare(root):
 js=root/'static/tv-library-form.js';module=root/'tv_library_form.py';page=root/'static/index.html';version=root/'version.json'
 source=js.read_text(encoding='utf-8');backend=module.read_text(encoding='utf-8');html=page.read_text(encoding='utf-8')
 if source==PAYLOAD['static/tv-library-form.js'] and backend==PAYLOAD['tv_library_form.py']:return None
 if hashlib.sha256(source.encode()).hexdigest() not in KNOWN_JS:raise ValueError('Biblioteca diferente da versão revisada. Nada alterado; envie a versão atual para conferência.')
 if hashlib.sha256(backend.encode()).hexdigest() not in KNOWN_MODULE:raise ValueError('Módulo da biblioteca diferente da versão revisada. Nada alterado.')
 html,count=re.subn(r'tv-library-form\.js\?v=[^"\s>]+','tv-library-form.js?v=20261022-nome-tema-2',html)
 if count!=1:raise ValueError('Referência da biblioteca diferente da esperada. Nada alterado.')
 compile(PAYLOAD['tv_library_form.py'],str(module),'exec')
 v=json.loads(version.read_text(encoding='utf-8'));v['web_version']='tv-biblioteca-nome-tema-20261022-v2'
 return {js:PAYLOAD['static/tv-library-form.js'],module:PAYLOAD['tv_library_form.py'],page:html,version:json.dumps(v,ensure_ascii=False)}
def atomic(file,text):
 tmp=file.with_name(file.name+'.'+uuid.uuid4().hex+'.tmp')
 try:
  tmp.write_text(text,encoding='utf-8');shutil.copymode(file,tmp);os.replace(tmp,file)
 finally:
  if tmp.exists():tmp.unlink()
def apply(root,check_health=True):
 changes=prepare(root)
 if changes is None:return None
 database=root/'dados/fsj.sqlite'
 if not database.is_file():raise ValueError('Banco esperado não localizado. Nada alterado.')
 if check_health:health(root)
 lock=root/'dados/updates/applying';lock.parent.mkdir(parents=True,exist_ok=True)
 try:
  with lock.open('x') as f:f.write('tv-library-names-themes-v2')
 except FileExistsError:raise ValueError('Outra atualização está em curso. Tente ao terminar.')
 backup=root/'backups'/('biblioteca-nome-tema-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'-'+uuid.uuid4().hex[:8])
 try:
  if check_health:health(root)
  backup.mkdir(parents=True,mode=0o700)
  for file in changes:
   target=backup/file.relative_to(root);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(file,target)
  with sqlite3.connect(database,timeout=15) as c:
   columns={r[1] for r in c.execute('PRAGMA table_info(library_metadata)')}
   if not {'video_id','theme','description'}<=columns:raise ValueError('Metadados diferentes do esperado. Nada alterado.')
   with sqlite3.connect(backup/'fsj.sqlite') as dest:c.backup(dest)
   os.chmod(backup/'fsj.sqlite',0o600)
   c.execute('BEGIN IMMEDIATE')
   count=c.execute("INSERT INTO library_metadata(video_id,theme,description) SELECT v.id,'Outros','' FROM videos v WHERE NOT EXISTS(SELECT 1 FROM library_metadata m WHERE m.video_id=v.id)").rowcount
   count+=c.execute("UPDATE library_metadata SET theme='Outros' WHERE theme IS NULL OR lower(trim(theme)) IN ('','sem tema','sem classificação','sem classificacao','sem categoria')").rowcount
   try:
    for file,text in changes.items():atomic(file,text)
    c.commit()
   except Exception:
    c.rollback()
    for file in changes:shutil.copy2(backup/file.relative_to(root),file)
    raise
  if check_health:
   try:
    subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
    failure=None
    for attempt in range(10):
     try:health(root);failure=None;break
     except Exception as error:failure=error;time.sleep(1)
    if failure:raise failure
   except Exception as error:
    for file in changes:shutil.copy2(backup/file.relative_to(root),file)
    subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=False)
    raise RuntimeError('A atualização não passou na verificação. Arquivos anteriores restaurados. A classificação em Outros e todos os vídeos foram preservados.') from error
  return backup,count
 finally:lock.unlink(missing_ok=True)
def main():
 root=Path(sys.argv[1] if len(sys.argv)>1 else '/home/urbano/fsj-video-v001').expanduser().resolve()
 result=apply(root)
 if result is None:print('Biblioteca já atualizada: nomes, temas e seleção sem repetições.');return
 backup,count=result
 print('INSTALADO: Nome do vídeo para arquivo/YouTube, tema editável e listas sem repetições.')
 print('Vídeos antigos classificados em Outros:',count)
 print('Nenhum vídeo, conta, senha ou chamada foi excluído. Rotina das 7h preservada.')
 print('Backup:',backup)
 print('Feche e reabra Vídeos e Chamadas. O serviço foi atualizado automaticamente. Não precisa reiniciar a VM.')
if __name__=='__main__':main()

