#!/usr/bin/env python3
"""Atualização conservadora: nomes, lista sem repetição e legado em Outros."""
from pathlib import Path
import base64,datetime,hashlib,json,os,re,shutil,sqlite3,ssl,subprocess,sys,time,urllib.request,uuid,zlib
PAYLOAD=json.loads(zlib.decompress(base64.b64decode('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')).decode())
KNOWN_JS=set(['2ec9a13a723defef3f85c19d5ccef79b6097123c96b166e921d37aca415907fb', '7cb84407f7b4fee1710c4d54991870a83be93c879544827e6156773d20ca0a4c', 'cc2d31d7f865f0fe0c4e7e4d7c713772cd42d378727d52595dab47e2c2690559', 'df842b88e0967543a9e700b5b8cbfe27dfb2f677b80721f7762ecaff1e400c18'])
KNOWN_MODULE=set(['665376aa4e062363454d4f82f85a7464b94718025514a8b97fbf27a66e562fe3', 'c23c9ed5ca6a53e821a654b24c87cb85e8e70f512b07a5fcc6661d58920ebcf0', 'ef397b3b3ecced938f2a4ad95f13edd5155ba229f8d29937606b9d0dfc507709'])
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

