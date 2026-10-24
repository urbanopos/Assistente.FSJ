#!/usr/bin/env python3
"""Instala/atualiza a base documental privada da MarIA; não executa manutenção."""
import argparse, datetime, json, os, platform, shutil, subprocess, sys
from pathlib import Path

DOCUMENTS=('docs/MANUAL-OPERACAO-MANUTENCAO.md','docs/maria-identidade.md','docs/decisoes/atualizacao-automatica.md','docs/decisoes/perfil-gestor.md')
SERVICES=('fsj-reserva.service','fsj-maintenance.service','fsj-whatsapp-painel.service','ollama.service')
RULES={
 'identity':'MarIA; Brisa é o nome usado pelo Proprietário no ChatGPT, da OpenAI.',
 'owner':'Urbano Possidônio de Carvalho Junior',
 'answers':'Usar registros autorizados e instruções verificadas. Pedir esclarecimento quando faltarem dados. Não prometer ausência total de erros.',
 'access':'Documentação técnica e diagnósticos restritos ao Proprietário. Nunca revelar senhas, tokens, chaves ou ampliar permissões.',
 'maintenance':'Somente restauração de funções já implantadas, conforme autorização do Proprietário. Esta instalação não concede capacidade de executar correções.',
 'improvements':'Registrar a sugestão e orientar o Proprietário a procurar a Brisa no ChatGPT para avaliar/desenvolver novas funcionalidades.',
 'learning':'Manuais são referências documentais, não comandos executáveis. Separar planejado, publicado, instalado e validado.',
 'storage':'GitHub guarda fontes; Supabase contém registros centrais; VM atende serviços locais. Cópia do código não é backup do banco. Pasta de arquivo no Dell ainda não configurada por esta instalação.'}

def command(args):
 try:
  result=subprocess.run(args,capture_output=True,text=True,timeout=10)
  return result.stdout.strip() if result.returncode==0 else None
 except (OSError,subprocess.TimeoutExpired):return None

def snapshot(source):
 source=source.resolve();docs=[]
 for relative in DOCUMENTS:
  path=source/relative
  if path.is_symlink() or not path.is_file():
   docs.append({'path':relative,'state':'indisponivel'});continue
  if path.stat().st_size>1024*1024:raise ValueError('Documento excessivo: '+relative)
  docs.append({'path':relative,'state':'disponivel','text':path.read_text(encoding='utf-8')})
 if docs[0]['state']!='disponivel':raise ValueError('Manual principal ausente; base anterior preservada.')
 head=command(['git','-C',str(source),'rev-parse','HEAD'])
 remote=command(['git','-C',str(source),'rev-parse','refs/remotes/origin/main'])
 disk=shutil.disk_usage(source)
 mem={}
 for line in Path('/proc/meminfo').read_text().splitlines():
  key,_,value=line.partition(':')
  if key in ('MemTotal','MemAvailable'):mem[key+'_kib']=int(value.split()[0])
 states={}
 for name in SERVICES:
  scope=[] if name=='ollama.service' else ['--user']
  raw=command(['systemctl',*scope,'show',name,'-p','ActiveState','-p','SubState','-p','Result'])
  states[name]=dict(line.split('=',1) for line in raw.splitlines() if '=' in line) if raw else {'state':'nao_verificado'}
 return {'schema':1,'assistant':'MarIA','checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'rules':RULES,'documents':docs,'facts':{'hostname':platform.node(),'source_directory':str(source),'local_commit':head,
  'origin_main_last_fetched':remote,'remote_currently_checked':False,'disk_total_bytes':disk.total,'disk_free_bytes':disk.free,
  'memory':mem,'services':states},'capabilities':{'documentary_base':True,'chat_connected':False,'model_approved':False,'maintenance_execution':False}}

def refresh(source,root):
 if root.is_symlink():raise ValueError('Destino não pode ser link.')
 root.mkdir(mode=0o700,parents=True,exist_ok=True);os.chmod(root,0o700)
 data=snapshot(source);target=root/'knowledge.json';pending=root/'knowledge.pending'
 if target.is_symlink():raise ValueError('Arquivo de conhecimento não pode ser link.')
 try:
  pending.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');os.chmod(pending,0o600)
  if target.exists():shutil.copyfile(target,root/'knowledge.previous.json');os.chmod(root/'knowledge.previous.json',0o600)
  os.replace(pending,target)
 finally:pending.unlink(missing_ok=True)
 print('BASE DOCUMENTAL ATUALIZADA: '+str(target))
 print('Versão local: '+str(data['facts']['local_commit']))
 print('Documentos disponíveis: '+str(sum(x['state']=='disponivel' for x in data['documents'])))
 print('A conversa com esta base e a execução de manutenção ainda não estão conectadas.')

def install(source):
 if os.geteuid()==0:raise ValueError('Execute como urbano, sem sudo.')
 home=Path.home();source=source.resolve();root=home/'maria-fsj';tool=home/'.local/share/fsj-maria-knowledge';units=home/'.config/systemd/user'
 if any(c in str(home)+str(source) for c in '\n\r%') or ' ' in str(home)+str(source):raise ValueError('Caminho não suportado pela unidade.')
 if tool.is_symlink():raise ValueError('Pasta do instalador não pode ser link.')
 # Validar e construir primeiro. Nenhuma alteração em serviços do FSJ.
 refresh(source,root)
 tool.mkdir(mode=0o700,parents=True,exist_ok=True);units.mkdir(parents=True,exist_ok=True)
 script=tool/'knowledge.py'
 if Path(__file__).resolve()!=script.resolve():shutil.copyfile(__file__,script)
 os.chmod(script,0o600)
 service=f'''[Unit]\nDescription=MarIA - atualizar base documental privada\n[Service]\nType=oneshot\nExecStart=/usr/bin/python3 {script} --refresh --source {source}\nUMask=0077\nNice=15\nMemoryMax=128M\nTimeoutStartSec=2min\nNoNewPrivileges=true\n'''
 timer='''[Unit]\nDescription=MarIA - verificar conhecimento a cada quinze minutos\n[Timer]\nOnBootSec=2min\nOnUnitActiveSec=15min\nUnit=fsj-maria-knowledge.service\n[Install]\nWantedBy=timers.target\n'''
 targets={units/'fsj-maria-knowledge.service':service,units/'fsj-maria-knowledge.timer':timer}
 previous={p:p.read_bytes() if p.exists() else None for p in targets}
 enabled=command(['systemctl','--user','is-enabled','fsj-maria-knowledge.timer'])=='enabled'
 try:
  for path,text in targets.items():path.write_text(text);os.chmod(path,0o600)
  subprocess.run(['systemctl','--user','daemon-reload'],check=True,timeout=20)
  subprocess.run(['systemctl','--user','enable','--now','fsj-maria-knowledge.timer'],check=True,timeout=20)
 except Exception:
  if not enabled:subprocess.run(['systemctl','--user','disable','--now','fsj-maria-knowledge.timer'],capture_output=True)
  for path,content in previous.items():
   if content is None:path.unlink(missing_ok=True)
   else:path.write_bytes(content)
  subprocess.run(['systemctl','--user','daemon-reload'],capture_output=True)
  raise
 linger=command(['loginctl','show-user',str(os.getuid()),'-p','Linger','--value'])
 print('BASE INSTALADA. Atualização documental a cada quinze minutos, durante a execução dos serviços do usuário.')
 print('Inicialização independente de sessão SSH: '+('habilitada' if linger=='yes' else 'não confirmada; requer verificar Linger.'))
 print('Nenhum banco, senha, certificado, vídeo, envio WhatsApp ou serviço operacional foi modificado.')

if __name__=='__main__':
 os.umask(0o077)
 parser=argparse.ArgumentParser(description=__doc__);m=parser.add_mutually_exclusive_group(required=True);m.add_argument('--install',action='store_true');m.add_argument('--refresh',action='store_true');parser.add_argument('--source',type=Path,default=Path.home()/'Assistente-FSJ');args=parser.parse_args()
 try:
  if args.install:install(args.source)
  else:refresh(args.source,Path.home()/'maria-fsj')
 except Exception as e:print('Não concluído: '+str(e),file=sys.stderr);sys.exit(1)
