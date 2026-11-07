"""Integração incremental; recusa formato desconhecido e preserva backup."""
from pathlib import Path
import ast,datetime,shutil,sys,json

def prepare(root):
 server=(root/'server.py').read_text();app=(root/'static/app.js').read_text()
 if 'FSJ_LIBRARY_THEMES_V1' in app:raise ValueError('Biblioteca por temas já instalada.')
 marker="if __name__=='__main__':"
 if server.count(marker)!=1:raise ValueError('Inicialização diferente da esperada.')
 insert="c.execute('INSERT INTO videos VALUES(?,?,?,?,?,?,?)',(ident,title,mime,n,int(inst),'*' if inst else allowed,time.time()))"
 if server.count(insert)!=1:raise ValueError('Cadastro de vídeos diferente do esperado; nenhuma alteração aplicada.')
 server=server.replace(insert,insert+"\n     meta=fsj_library_metadata({k:q.get(k,[''])[0] for k in ('theme','description')})\n     c.execute('INSERT INTO library_metadata(video_id,theme,description) VALUES(?,?,?)',(ident,meta['theme'],meta['description']))")
 # Identificador do upload original permite manter os registros e arquivos existentes.
 server=server.replace(marker,"# FSJ_LIBRARY_THEMES_V1\nfrom library_videos import install as fsj_library_install, metadata as fsj_library_metadata\nfsj_library_install(globals())\n\n"+marker)
 anchor="const q=new URLSearchParams({title,institutional:institutional?'1':'0',allowed});"
 if app.count(anchor)!=1:raise ValueError('Envio de arquivo diferente do esperado.')
 focus="document.activeElement===$('callNewTitle')"
 if app.count(focus) not in (1,2):raise ValueError('Proteção de edição diferente da esperada.')
 app=app.replace(focus,"document.activeElement?.matches('input,textarea,[contenteditable=true]')")
 app=app.replace(anchor,"const q=new URLSearchParams({title,institutional:institutional?'1':'0',allowed,theme:institutional?'':($('libraryTheme')?.value||''),description:institutional?'':($('libraryDescription')?.value||'')});")
 csp="frame-ancestors 'none'; base-uri 'none'"
 if csp not in server:raise ValueError('Política de reprodução não localizada.')
 server=server.replace(csp,"frame-src 'self' https://www.youtube.com; frame-ancestors 'none'; base-uri 'none'")
 # O YouTube exige o Referer do player incorporado; mantém política restritiva entre origens.
 server=server.replace("self.send_header('Referrer-Policy','no-referrer')","self.send_header('Referrer-Policy','strict-origin-when-cross-origin')")
 ast.parse(server)
 return {'server.py':server,'static/app.js':app+'\n'+(Path(__file__).parent/'library.js').read_text(),'library_videos.py':(Path(__file__).parent/'library_videos.py').read_text()}

def install(root):
 root=Path(root);changes=prepare(root)
 version=json.loads((root/'version.json').read_text());version['web_version']='biblioteca-temas-20261019-01';changes['version.json']=json.dumps(version,ensure_ascii=False)+'\n'
 backup=root/'backups'/('biblioteca-temas-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
 originals={name:(root/name).read_bytes() if (root/name).exists() else None for name in changes}
 for name,content in originals.items():
  if content is not None:
   target=backup/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(content)
 try:
  for name,content in changes.items():
   target=root/name;temp=target.with_suffix(target.suffix+'.library.tmp');temp.write_text(content);temp.replace(target)
 except BaseException:
  for name,content in originals.items():
   if content is None:(root/name).unlink(missing_ok=True)
   else:(root/name).write_bytes(content)
  raise
 print('Biblioteca preparada. Backup: '+str(backup))
 print('Reinício controlado do serviço necessário, sem chamada ou edição em curso. Não foi executado por este instalador.')

if __name__=='__main__':install(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001')
