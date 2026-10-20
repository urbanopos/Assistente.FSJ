"""Sessão do módulo VM validada no Auth e na titularidade central; sem senha compartilhada."""
import base64,json,secrets,ssl,threading,time,urllib.request,urllib.error,urllib.parse
from http.cookies import SimpleCookie
URL='https://awrxnzbfrsaurzpunuko.supabase.co'
KEY='sb_publishable_IU8K4qN5LLWSmr8Z4vYxMA_NiEY9gu3'
LOCK=threading.RLock()
AUTH={}
class SSOError(Exception):
 def __init__(self,status,message):self.status=status;self.message=message
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):raise SSOError(503,'Validação central indisponível.')
def request(path,token):
 req=urllib.request.Request(URL+path,headers={'apikey':KEY,'Authorization':'Bearer '+token,'Accept':'application/json'})
 try:
  with urllib.request.build_opener(NoRedirect()).open(req,timeout=10) as response:raw=response.read(131073)
  if len(raw)>131072:raise SSOError(503,'Resposta central inválida.')
  return json.loads(raw)
 except urllib.error.HTTPError as error:
  if error.code in (401,403):raise SSOError(401,'Sessão do principal expirada ou sem autorização.') from None
  raise SSOError(503,'Não foi possível validar a sessão no principal.') from None
 except (OSError,ValueError):raise SSOError(503,'Validação central indisponível. Confira a internet da VM.') from None
def validate(token):
 if not isinstance(token,str) or not 50<=len(token)<=12000 or any(c.isspace() for c in token):raise SSOError(401,'Sessão inválida.')
 user=request('/auth/v1/user',token)
 if not isinstance(user,dict) or not isinstance(user.get('id'),str) or not user.get('email_confirmed_at') or user.get('is_anonymous'):raise SSOError(403,'Identidade não autorizada.')
 uid=user['id'];rows=request('/rest/v1/fsj_titularidade?select=auth_user_id&auth_user_id=eq.'+urllib.parse.quote(uid,safe=''),token)
 if not isinstance(rows,list) or not any(row.get('auth_user_id')==uid for row in rows if isinstance(row,dict)):raise SSOError(403,'Acesso à TV FSJ ainda não autorizado para este perfil.')
 try:
  part=token.split('.')[1];claims=json.loads(base64.urlsafe_b64decode(part+'='*(-len(part)%4)))
  expires=float(claims['exp'])
 except (ValueError,KeyError,IndexError,TypeError):raise SSOError(401,'Sessão inválida.') from None
 if expires<=time.time()+5:raise SSOError(401,'Sessão do principal expirada.')
 return uid,min(expires,time.time()+900)
def cookie_token(handler):
 cookie=SimpleCookie()
 try:cookie.load(handler.headers.get('Cookie',''))
 except Exception:return None
 return cookie['fsj_sso'].value if 'fsj_sso' in cookie else None
def discard(server,token):
 with LOCK:AUTH.pop(token,None)
 with server.SESSION_LOCK:server.SESSIONS.pop(token,None)
def guard(server,token,user):
 with LOCK:meta=AUTH.get(token)
 if not meta:return None if isinstance(token,str) and token.startswith('sso_') else user
 if not user or time.time()>=meta['expires']:
  discard(server,token);return None
 if time.time()-meta['checked']>=60:
  # Serializa as revalidações, incluindo as requisições paralelas de mídia.
  with LOCK:
   meta=AUTH.get(token)
   if not meta:return None
   if time.time()-meta['checked']>=60:
    try:
     uid,expires=validate(meta['access_token'])
     if uid!=meta['uid']:raise SSOError(403,'Identidade alterada.')
     meta['checked']=time.time();meta['expires']=min(meta['expires'],expires)
    except SSOError:discard(server,token);return None
 return {**user,'sso':True}
def clear(handler,server):
 token=cookie_token(handler)
 if token:discard(server,token)
 handler.send_response(200);handler.headers_common();handler.send_header('Set-Cookie','fsj_sso=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned');handler.send_header('Content-Type','application/json');handler.send_header('Content-Length','2');handler.end_headers();handler.wfile.write(b'{}')
def route(handler,server,path):
 if path not in ('/api/sso/exchange','/api/sso/logout') and not (path=='/api/logout' and cookie_token(handler)):return False
 if path!='/api/sso/exchange':clear(handler,server);return True
 try:
  if not isinstance(handler.connection,ssl.SSLSocket):raise SSOError(403,'A autenticação única exige HTTPS.')
  if not server.throttle(('sso',handler.client_address[0]),60,300):raise SSOError(429,'Muitas solicitações. Aguarde um momento.')
  data=handler.body();uid,expires=validate(data.get('access_token'))
  with server.db() as c:
   owners=c.execute("SELECT id FROM users WHERE role='owner' AND status='active'").fetchall()
   if len(owners)!=1:raise SSOError(403,'O proprietário local precisa ser verificado na VM.')
   local=owners[0]['id']
  old=cookie_token(handler)
  with LOCK:meta=AUTH.get(old)
  token=old if meta and meta['uid']==uid else 'sso_'+secrets.token_urlsafe(32)
  with LOCK:
   # Remove credenciais expiradas da memória, sem tocar nas sessões nativas.
   for key,value in list(AUTH.items()):
    if value['expires']<=time.time():discard(server,key)
   AUTH[token]={'uid':uid,'access_token':data['access_token'],'expires':expires,'checked':time.time()}
  with server.SESSION_LOCK:server.SESSIONS[token]=(local,expires)
  if token!=old:
   with server.db() as c:server.audit(c,local,local,'sso-central-login')
  raw=b'{}';handler.send_response(200);handler.headers_common();handler.send_header('Set-Cookie','fsj_sso='+token+'; Path=/; Max-Age='+str(max(1,int(expires-time.time())))+'; HttpOnly; Secure; SameSite=None; Partitioned');handler.send_header('Content-Type','application/json');handler.send_header('Content-Length',str(len(raw)));handler.end_headers();handler.wfile.write(raw)
 except SSOError as error:handler.reply(error.status,{'error':error.message})
 return True
