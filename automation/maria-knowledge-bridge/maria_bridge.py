"""Consulta documental da MarIA, somente titular central autenticado."""
import datetime,json,ssl
from pathlib import Path
from urllib.parse import urlparse
ORIGIN='https://urbanopos.github.io'
PATHS={'/api/maria/status','/api/maria/ask'}
BASE=Path.home()/'maria-fsj/knowledge.json'
def normalize(text):
 import unicodedata,re
 return re.sub(r'[^a-z0-9 ]',' ',unicodedata.normalize('NFD',text.lower()).encode('ascii','ignore').decode())
def answer(question,data):
 q=normalize(question);facts=data['facts'];rules=data['rules']
 if any(x in q for x in ('senha','token','chave privada','credencial')):
  return 'Senhas, tokens e chaves não fazem parte desta base. Consulte a configuração protegida sob sua responsabilidade; não envie credenciais pela conversa.'
 if any(x in q for x in ('memoria','ram','disco','espaco')):
  mem=facts.get('memory',{});disk=facts.get('disk_free_bytes',0)/(1024**3)
  return 'Na última verificação, a VM tinha %.1f GiB de RAM total, %.1f GiB disponíveis e %.1f GiB livres em disco. Verificação: %s. São dados daquele momento; a disponibilidade varia.'%(mem.get('MemTotal_kib',0)/1024**2,mem.get('MemAvailable_kib',0)/1024**2,disk,data['checked_at'])
 if any(x in q for x in ('versao','atualizad','commit','github')):
  return 'A cópia local verificada está no commit '+str(facts.get('local_commit'))+'. A referência origin/main da última busca está em '+str(facts.get('origin_main_last_fetched'))+'. Não consultei a versão atual do GitHub. Publicação, instalação e validação são etapas distintas.'
 if any(x in q for x in ('melhoria','nova func','nova facilidade','desenvolv')):return rules['improvements']
 if any(x in q for x in ('manutenc','corrigir','consert','erro')):return rules['maintenance']+' Posso apresentar instruções documentadas; esta conexão não executa correções.'
 if any(x in q for x in ('propriedad','proprietari','quem e voce','seu nome')):return 'Sou MarIA, assistente do sistema de Urbano Possidônio de Carvalho Junior. Esta conexão usa uma base documental local. O modelo de linguagem não foi aprovado para responder livremente.'
 if any(x in q for x in ('pasta','armazen','backup','recupera','dell','supabase')):return rules['storage']
 if any(x in q for x in ('servico','servidor','funcionando')):
  return 'Estados na última verificação: '+ '; '.join(name+': '+str(state.get('ActiveState',state.get('state','não verificado'))) for name,state in facts.get('services',{}).items())+'. Verificação: '+data['checked_at']+'.'
 return 'Não identifiquei uma resposta verificada na base técnica. Pode especificar se a dúvida é sobre memória, disco, versão, serviços, armazenamento, manutenção ou proposta de melhoria? Para tarefas, use a consulta autorizada no painel.'
def install(namespace):
 cls=namespace['Handler']
 if getattr(cls,'_maria_bridge',False):return
 old_get,old_post,old_headers=cls.do_GET,cls.do_POST,cls.headers_common
 old_options=getattr(cls,'do_OPTIONS',None)
 def headers(self):
  old_headers(self)
  if urlparse(self.path).path in PATHS and self.headers.get('Origin')==ORIGIN:
   self.send_header('Access-Control-Allow-Origin',ORIGIN);self.send_header('Vary','Origin')
   self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS');self.send_header('Access-Control-Allow-Headers','Authorization, Content-Type, X-FSJ-Request')
   if self.headers.get('Access-Control-Request-Private-Network')=='true':self.send_header('Access-Control-Allow-Private-Network','true')
 def route(self):
  path=urlparse(self.path).path
  if not isinstance(self.connection,ssl.SSLSocket):return self.reply(403,{'error':'HTTPS obrigatório.'})
  origin=self.headers.get('Origin')
  if origin and origin not in (ORIGIN,'https://'+self.headers.get('Host','')):return self.reply(403,{'error':'Origem não autorizada.'})
  if not namespace['throttle'](('maria',self.client_address[0]),30,60):return self.reply(429,{'error':'Aguarde antes de tentar novamente.'})
  token=self.headers.get('Authorization','')
  if not token.startswith('Bearer '):return self.reply(401,{'error':'Acesso autenticado do Proprietário obrigatório.'})
  import fsj_sso
  try:
   uid,_=fsj_sso._validate_owner(token[7:])
   if uid.startswith('board:'):return self.reply(403,{'error':'Consulta técnica exclusiva do Proprietário.'})
  except fsj_sso.SSOError as e:return self.reply(e.status,{'error':e.message})
  if (path.endswith('/status') and self.command!='GET') or (path.endswith('/ask') and self.command!='POST'):return self.reply(405,{'error':'Método inválido.'})
  try:
   if BASE.is_symlink() or BASE.stat().st_size>5*1024*1024:raise ValueError()
   data=json.loads(BASE.read_text());checked=datetime.datetime.fromisoformat(data['checked_at']);age=(datetime.datetime.now(datetime.timezone.utc)-checked).total_seconds()
   if age<0 or age>3600:return self.reply(503,{'error':'A base técnica precisa de atualização. Não vou usar dados antigos como estado atual.'})
   if path.endswith('/status'):return self.reply(obj={'ready':True,'mode':'documental','checked_at':data['checked_at'],'model_approved':False})
   if self.headers.get('X-FSJ-Request')!='1':return self.reply(403,{'error':'Cabeçalho obrigatório ausente.'})
   body=self.body();question=body.get('message')
   if not isinstance(question,str) or not 1<=len(question.strip())<=2000:return self.reply(400,{'error':'Pergunta inválida.'})
   return self.reply(obj={'answer':answer(question,data),'actions':[],'mode':'documental','checked_at':data['checked_at']})
  except (OSError,ValueError,KeyError,TypeError):return self.reply(503,{'error':'Base documental indisponível. Nenhum registro foi alterado.'})
 def get(self):return route(self) if urlparse(self.path).path in PATHS else old_get(self)
 def post(self):
  if urlparse(self.path).path not in PATHS:return old_post(self)
  if (namespace['DATA']/'updates/applying').exists():return self.reply(503,{'error':'Atualização em andamento.'})
  return route(self)
 def options(self):
  if urlparse(self.path).path not in PATHS:return old_options(self) if old_options else self.send_error(405)
  if self.headers.get('Origin')!=ORIGIN:return self.reply(403,{'error':'Origem não autorizada.'})
  self.send_response(204);self.headers_common();self.send_header('Content-Length','0');self.end_headers()
 cls.do_GET=get;cls.do_POST=post;cls.do_OPTIONS=options;cls.headers_common=headers;cls._maria_bridge=True
