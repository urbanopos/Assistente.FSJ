"""Transferência privada do estado do executor. Nunca publica sessão como artefato GitHub."""
import os,sys,tarfile,tempfile,urllib.request,urllib.error
from pathlib import Path
BASE='https://awrxnzbfrsaurzpunuko.supabase.co'
def run(mode):
    root=Path(os.environ['FSJ_EMERGENCY_STATE_DIR'])
    key=os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    bucket=os.environ.get('FSJ_EMERGENCY_STATE_BUCKET','fsj-emergency-state')
    if not key: raise SystemExit('Credencial protegida ausente.')
    if not bucket.replace('-','').isalnum(): raise SystemExit('Nome do armazenamento inválido.')
    headers={'apikey':key,'Authorization':'Bearer '+key}
    path=bucket+'/executor.tar.gz'
    if mode=='restore':
        req=urllib.request.Request(BASE+'/storage/v1/object/authenticated/'+path,headers=headers)
        try:
            with urllib.request.urlopen(req,timeout=30) as r: payload=r.read(512*1024*1024+1)
        except urllib.error.HTTPError as e:
            raise SystemExit('Sessão privada indisponível (HTTP '+str(e.code)+'). Vinculação inicial pendente.')
        if len(payload)>512*1024*1024: raise SystemExit('Estado excede o limite.')
        root.mkdir(parents=True,exist_ok=True,mode=0o700)
        with tempfile.TemporaryFile() as f:
            f.write(payload);f.seek(0)
            with tarfile.open(fileobj=f,mode='r:gz') as archive:
                archive.extractall(root,filter='data')
        if not (root/'auth').is_dir(): raise SystemExit('Arquivo privado não contém sessão autorizada.')
        (root/'.restored').write_text('ok')
    elif mode=='save':
        if not (root/'.restored').is_file():
            print('Sessão não restaurada; nada será sobrescrito.');return
        # O processo Node deve ter encerrado antes de copiar o perfil Chromium.
        if (root/'agent.lock').exists(): raise SystemExit('Executor ainda ativo ou encerramento incerto; estado remoto preservado.')
        def selected(info):
            name=Path(info.name).name
            return None if name in ('agent.lock','.restored') or name.startswith(('Singleton','DevToolsActivePort')) or info.issym() or info.islnk() else info
        with tempfile.TemporaryFile() as f:
            with tarfile.open(fileobj=f,mode='w:gz') as archive: archive.add(root,arcname='.',filter=selected)
            f.seek(0);payload=f.read()
        req=urllib.request.Request(BASE+'/storage/v1/object/'+path,data=payload,method='POST',headers={**headers,'Content-Type':'application/gzip','x-upsert':'true'})
        try:
            with urllib.request.urlopen(req,timeout=60) as r: r.read()
        except urllib.error.HTTPError as e: raise SystemExit('Não foi possível preservar a sessão privada (HTTP '+str(e.code)+').')
    else: raise SystemExit('Operação inválida.')
if __name__=='__main__':run(sys.argv[1])
