from pathlib import Path
import datetime,json,os,re,shutil,sqlite3,ssl,subprocess,sys,time,urllib.request
MARK='FSJ_TV_LIBRARY_FORM_V1'
PAYLOAD={} # bundled by build.py

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
