from pathlib import Path
import base64,zlib,datetime,json,os,re,shutil,sqlite3,ssl,subprocess,sys,time,urllib.request
MARK='FSJ_TV_LIBRARY_FORM_V1'
PAYLOAD=json.loads(zlib.decompress(base64.b64decode('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')).decode())

def prepare(root):
 server=(root/'server.py').read_text(encoding='utf-8');app=(root/'static/app.js').read_text(encoding='utf-8');html=(root/'static/index.html').read_text(encoding='utf-8')
 if MARK in app:return None
 if not (root/'library_videos.py').is_file() or not (root/'fsj_sso.py').is_file() or 'FSJ_TV_POSTER_V1' not in app or 'FSJ_TV_TWO_PAGES_V1' not in app:raise ValueError('A versão esperada da TV FSJ não foi localizada. Nada alterado; envie os arquivos atuais para revisão.')
 matches=list(re.finditer(r'const descriptions=\{[^\n]+?\};',app))
 if len(matches)!=1:raise ValueError('Menu diferente do esperado. Nada alterado.')
 descriptions="const descriptions={taskHome:'Tarefas',projection:'TV FSJ',fsjThemeLibrary:'Assistir vídeos da biblioteca',callPanel:'Chamadas de vídeo',institutionalUpload:'Enviar vídeo institucional',accountsPanel:'Autorização de contas - Aprovação de novos integrantes'};"
 app=app[:matches[0].start()]+descriptions+app[matches[0].end():]
 anchor="fsjOptions(select,cards.map(x=>new Option(descriptions[x.id]||x.querySelector('h1,h2')?.textContent,x.id)));select.value=active;"
 replacement="fsjOptions(select,[new Option('Selecione uma opção…',''),...cards.filter(x=>!['projection','libraryUpload'].includes(x.id)).map(x=>new Option(descriptions[x.id]||x.querySelector('h1,h2')?.textContent,x.id))]);select.value=active==='projection'?'':active;"
 if app.count(anchor)!=1:raise ValueError('Seletor diferente do esperado. Nada alterado.')
 app=app.replace(anchor,replacement,1)
 anchor='function units(el){'
 if app.count(anchor)!=1:raise ValueError('Paginação diferente do esperado. Nada alterado.')
 app=app.replace(anchor,anchor+"if(el.id==='fsjThemeLibrary')return [document.getElementById('fsjThemeLibraryForm')];if(el.id==='institutionalUpload')return [document.getElementById('fsjInstitutionalEditor')];",1)
 anchor="$('screenSelect').onchange="
 if app.count(anchor)!=1:raise ValueError('Navegação diferente do esperado. Nada alterado.')
 app=app.replace(anchor,"window.fsjChooseVideoScreen=function(id){const card=$(id);if(!card||card.hidden)return;active=id;step=0;update();};\n "+anchor,1)
 old="$('previousPage').disabled=step===0&&!(active==='accountsPanel'&&accountStep>1);"
 if app.count(old)!=1:raise ValueError('Estado das setas diferente do esperado. Nada alterado.')
 app=app.replace(old,"$('previousPage').disabled=step===0&&active==='projection';",1)
 old="$('previousPage').onclick=()=>{"
 if app.count(old)!=1:raise ValueError('Retorno diferente do esperado. Nada alterado.')
 app=app.replace(old,old+"if(step===0&&active!=='projection'&&!(active==='accountsPanel'&&accountStep>1)){active='projection';window.fsjTVHome?.();update();return;}",1)
 app+='\n/* '+MARK+' */\n'
 anchor="if __name__=='__main__':"
 if server.count(anchor)!=1:raise ValueError('Inicialização do servidor diferente. Nada alterado.')
 hook='from tv_library_form import install as fsj_tv_library_form_install\nfsj_tv_library_form_install(globals())\n\n'
 server=server.replace(anchor,hook+anchor,1)
 html,n=re.subn(r'(<link[^>]+href=[\"\']/style\.css(?:\?[^\"\']*)?[\"\'][^>]*>)',r'\1<link rel="stylesheet" href="/tv-library-form.css?v=20261020-1">',html,count=1)
 if n!=1 or html.count('</html>')!=1:raise ValueError('Estrutura HTML diferente. Nada alterado.')
 html=html.replace('</html>','<script src="/tv-library-form.js?v=20261020-1"></script></html>')
 prepared={root/'server.py':server,root/'static/app.js':app,root/'static/index.html':html,**{root/k:v for k,v in PAYLOAD.items()}}
 version=root/'version.json'
 if version.exists():
  data=json.loads(version.read_text());data['web_version']='tv-temas-20261020-v1';prepared[version]=json.dumps(data,ensure_ascii=False)+'\n'
 for path,content in prepared.items():
  if path.suffix=='.py':compile(content,str(path),'exec')
 return prepared

def health(root):
 context=ssl.create_default_context(cafile=str(root/'dados/tls/fsj-ca.crt'))
 with urllib.request.urlopen('https://127.0.0.1:8443/api/version',context=context,timeout=8) as r:return json.load(r)
def main():
 root=Path(sys.argv[1] if len(sys.argv)>1 else '/home/urbano/fsj-video-v001').resolve()
 try:prepared=prepare(root)
 except (ValueError,OSError) as e:raise SystemExit(str(e))
 if prepared is None:print('Formulário já instalado. Atualize o principal e reabra Vídeos e Chamadas.');return
 if health(root).get('busy'):raise SystemExit('Há chamada ou envio em andamento. Encerre e execute novamente; nada alterado.')
 flag=root/'dados/updates/applying';flag.parent.mkdir(parents=True,exist_ok=True)
 try:fd=os.open(flag,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600);os.close(fd)
 except FileExistsError:raise SystemExit('Outra atualização está em andamento. Nada alterado.')
 backup=root/'backups'/('tv-temas-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));existed={p:p.exists() for p in prepared};written=False
 try:
  if health(root).get('busy'):raise RuntimeError('Aplicativo em uso; tente após encerrar a chamada ou envio.')
  backup.mkdir(parents=True)
  for path,exists in existed.items():
   if exists:
    dest=backup/path.relative_to(root);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dest)
  database=root/'dados/fsj.sqlite'
  if database.exists():
   with sqlite3.connect(database) as source,sqlite3.connect(backup/'fsj.sqlite') as dest:source.backup(dest)
   os.chmod(backup/'fsj.sqlite',0o600)
  written=True
  for path,content in prepared.items():
   tmp=path.with_name(path.name+'.tv-temas.tmp');tmp.write_text(content,encoding='utf-8')
   if existed[path]:shutil.copymode(path,tmp)
   else:os.chmod(tmp,0o644)
   os.replace(tmp,path)
  subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
  for _ in range(10):
   try:health(root);break
   except (OSError,ValueError):time.sleep(.5)
  else:raise RuntimeError('Servidor não respondeu após a atualização.')
 except BaseException:
  if written:
   for path,exists in existed.items():
    if exists:shutil.copy2(backup/path.relative_to(root),path)
    else:path.unlink(missing_ok=True)
   subprocess.run(['systemctl','--user','restart','fsj-reserva.service'])
   print('Falha: arquivos anteriores restaurados.')
  raise
 finally:flag.unlink(missing_ok=True)
 print('INSTALADO: TV FSJ inicial, biblioteca por tema obrigatório, upload/YouTube e edição de tema.')
 print('Menu com Tarefas, Biblioteca e Chamadas; institucional e aprovação de contas exclusivos do Proprietário.')
 print('Backup:',backup)
 print('Atualize o principal com Ctrl+F5 e reabra Vídeos e Chamadas nos celulares.')
 print('Contas, senhas, vídeos, chamadas e rotina das 7h preservados. Nenhum vídeo enviado ou alterado pelo instalador.')
if __name__=='__main__':main()

