"""FSJ: recuperacao por WhatsApp com codigo de uso unico por 300 segundos."""
import hashlib, hmac, json, os, re, secrets, sqlite3, time
from contextlib import contextmanager

PREFIX = '/api/password-recovery/'
TTL = 300

def configure(server):
    folder = server.DATA / 'password-recovery'
    folder.mkdir(mode=0o700, parents=True, exist_ok=True)
    path = folder / 'worker.json'
    if not path.exists():
        value = json.dumps({'secret': secrets.token_urlsafe(48)})
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, 'w') as f: f.write(value)
    config = json.loads(path.read_text())
    return folder, config

@contextmanager
def database(server):
    folder, _ = configure(server)
    path = folder / 'recovery.sqlite'
    c = sqlite3.connect(path, timeout=15)
    c.row_factory = sqlite3.Row
    os.chmod(path, 0o600)
    try:
        c.executescript('''CREATE TABLE IF NOT EXISTS phones(uid TEXT PRIMARY KEY,phone TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY,uid TEXT NOT NULL,phone TEXT NOT NULL,
code TEXT,hash TEXT NOT NULL,created REAL NOT NULL,expires REAL NOT NULL,status TEXT NOT NULL,
attempts INTEGER NOT NULL DEFAULT 0,lease TEXT);
CREATE INDEX IF NOT EXISTS requests_uid ON requests(uid,created);''')
        with c: yield c
    finally: c.close()

def phone_number(value):
    value = re.sub(r'\D', '', str(value))
    if len(value) in (10, 11): value = '55' + value
    if not re.fullmatch(r'55[1-9][0-9]{9,10}', value):
        raise ValueError('Informe DDD e numero brasileiro do WhatsApp.')
    return value

def code_hash(secret, request, code):
    return hmac.new(secret.encode(), (request + ':' + code).encode(), hashlib.sha256).hexdigest()

def export_config(server):
    import base64
    _, cfg = configure(server)
    ca = server.DATA / 'tls/fsj-ca.crt'
    return {'url':'https://192.168.1.114:8443', 'secret':cfg['secret'],
            'ca':base64.b64encode(ca.read_bytes()).decode()}

def handle(handler, server, user, path):
    if not path.startswith(PREFIX): return False
    action = path[len(PREFIX):]
    data = handler.body()
    _, cfg = configure(server)
    now = time.time()
    def reply(status=200, **obj):
        handler.reply(status, obj)
        return True
    if action.startswith('worker/'):
        auth = handler.headers.get('Authorization', '')
        if not hmac.compare_digest(auth, 'Bearer ' + cfg['secret']):
            return reply(403, error='Nao autorizado.')
        with database(server) as c:
            c.execute('BEGIN IMMEDIATE')
            c.execute("UPDATE requests SET status='expired',code=NULL WHERE expires<=? AND status NOT IN ('used','expired')", (now,))
            if action == 'worker/ping': return reply(ok=True)
            if action == 'worker/claim':
                row = c.execute("SELECT * FROM requests WHERE status='queued' AND expires>? ORDER BY created LIMIT 1", (now+15,)).fetchone()
                if not row: return reply(job=None)
                lease = secrets.token_urlsafe(24)
                c.execute("UPDATE requests SET status='sending',lease=? WHERE id=?", (lease,row['id']))
                return reply(job={'id':row['id'],'phone':row['phone'],'code':row['code'],'expires':row['expires'],'lease':lease})
            if action == 'worker/ack':
                ok = data.get('sent') is True
                c.execute("UPDATE requests SET status=?,code=NULL WHERE id=? AND lease=? AND status='sending' AND expires>?",
                          ('sent' if ok else 'failed',str(data.get('id','')),str(data.get('lease','')),now))
                return reply(ok=True)
        return reply(404, error='Operacao indisponivel.')
    if action == 'owner/phone':
        if not user or user['role'] != 'owner': return reply(403,error='Somente o Proprietario pode confirmar contatos.')
        uid = str(data.get('id',''))
        with server.db() as c:
            target = c.execute('SELECT id FROM users WHERE id=?',(uid,)).fetchone()
            if not target: return reply(404,error='Conta nao encontrada.')
            phone = phone_number(data.get('phone',''))
            server.audit(c,user['id'],uid,'recovery-phone-confirmed')
        with database(server) as c:
            c.execute('INSERT OR REPLACE INTO phones(uid,phone) VALUES(?,?)',(uid,phone))
            c.execute("UPDATE requests SET status='cancelled',code=NULL WHERE uid=? AND status!='used'",(uid,))
        return reply(ok=True)
    if action == 'request':
        if not server.throttle(('password-recovery-ip',handler.client_address[0]),12,300):
            return reply(429,error='Muitas solicitacoes. Aguarde cinco minutos.')
        name = str(data.get('name','')).strip().lower()
        request = secrets.token_urlsafe(24)
        with server.db() as c:
            target = c.execute("SELECT id FROM users WHERE lower(name)=? AND status IN ('active','approved')",(name,)).fetchone()
        if target:
            with database(server) as c:
                c.execute('BEGIN IMMEDIATE')
                phone = c.execute('SELECT phone FROM phones WHERE uid=?',(target['id'],)).fetchone()
                recent = c.execute('SELECT * FROM requests WHERE uid=? ORDER BY created DESC LIMIT 1',(target['id'],)).fetchone()
                if phone and recent and now-recent['created']<60 and recent['expires']>now and recent['status'] in ('queued','sending','sent'):
                    request = recent['id']
                if phone and (not recent or now-recent['created']>=60):
                    code = str(secrets.randbelow(1000000)).zfill(6)
                    c.execute("UPDATE requests SET status='cancelled',code=NULL WHERE uid=? AND status!='used'",(target['id'],))
                    c.execute("INSERT INTO requests(id,uid,phone,code,hash,created,expires,status) VALUES(?,?,?,?,?,?,?,'queued')",
                              (request,target['id'],phone['phone'],code,code_hash(cfg['secret'],request,code),now,now+TTL))
                c.execute('DELETE FROM requests WHERE created<?',(now-86400,))
        return reply(request=request,expires_in=TTL,message='Se a conta estiver habilitada e tiver WhatsApp confirmado pelo Proprietario, o codigo sera enviado. Validade: 5 minutos.')
    if action == 'reset':
        if not server.throttle(('password-recovery-verify',handler.client_address[0]),30,300):
            return reply(429,error='Muitas tentativas. Aguarde cinco minutos.')
        request = str(data.get('request',''))
        code = str(data.get('code','')).strip()
        password = data.get('password')
        server.check_password(password)
        if password != data.get('confirmation'): return reply(400,error='As senhas nao conferem.')
        accepted = False
        with database(server) as c:
            c.execute('ATTACH DATABASE ? AS mainapp',(str(server.DATA/'fsj.sqlite'),))
            c.execute('BEGIN IMMEDIATE')
            row = c.execute("SELECT * FROM requests WHERE id=? AND status='sent' AND expires>? AND attempts<5",(request,now)).fetchone()
            if row:
                c.execute('UPDATE requests SET attempts=attempts+1 WHERE id=?',(request,))
                match = re.fullmatch(r'[0-9]{6}',code) and hmac.compare_digest(row['hash'],code_hash(cfg['secret'],request,code))
                target = c.execute("SELECT id FROM mainapp.users WHERE id=? AND status IN ('active','approved')",(row['uid'],)).fetchone()
                if match and target:
                    salt = secrets.token_hex(16)
                    c.execute("UPDATE mainapp.users SET hash=?,salt=?,status='active',activation_hash=NULL,activation_expires=NULL WHERE id=?",
                              (server.password_hash(password,salt),salt,row['uid']))
                    c.execute("UPDATE requests SET status='used',code=NULL WHERE uid=?",(row['uid'],))
                    c.execute('INSERT INTO mainapp.account_audit(actor,target,action,created) VALUES(?,?,?,?)',(row['uid'],row['uid'],'password-reset-whatsapp',now))
                    accepted = row['uid']
                elif row['attempts']+1>=5:
                    c.execute("UPDATE requests SET status='locked',code=NULL WHERE id=?",(request,))
        if not accepted: return reply(400,error='Codigo invalido, expirado ou ainda nao enviado. Solicite outro se necessario.')
        server.revoke(accepted)
        return reply(ok=True,message='Senha alterada. Entre com a nova senha.')
    return reply(404,error='Operacao indisponivel.')
