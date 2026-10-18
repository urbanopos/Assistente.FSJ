from pathlib import Path
import datetime,shutil,os
ROOT=Path.home()/'fsj-video-v001'
def rename(text):
 for before,after in [
 ('Assistente FSJ <span>RESERVA</span>','Assistente FSJ.VM'),
 ('Assistente FSJ Reserva','Assistente FSJ.VM'),
 ('FSJ Reserva','Assistente FSJ.VM'),
 ('Acesso a videoteca','Acesso ao Assistente FSJ.VM'),
 ('Acesso \u00e0 videoteca','Acesso ao Assistente FSJ.VM'),
 ('Instalar Reserva','Instalar Assistente FSJ.VM'),
 ('o Reserva','o Assistente FSJ.VM'),
 ('do Reserva','do Assistente FSJ.VM'),
 ('no Reserva','no Assistente FSJ.VM'),
 ('Reserva no iPhone','Assistente FSJ.VM no iPhone'),
 ]:text=text.replace(before,after)
 return text
changes={p:rename(p.read_text(encoding='utf-8')) for p in [ROOT/'static/index.html',ROOT/'static/app.js']}
changes={p:t for p,t in changes.items() if t!=p.read_text(encoding='utf-8')}
if not changes:print('Nome Assistente FSJ.VM ja aplicado.');raise SystemExit(0)
backup=ROOT/'backups'/('antes-nome-fsj-vm-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
for p in changes:shutil.copy2(p,backup/p.name)
try:
 for p,text in changes.items():
  tmp=p.with_name(p.name+'.nome.tmp');tmp.write_text(text,encoding='utf-8');shutil.copymode(p,tmp);os.replace(tmp,p)
except BaseException:
 for p in changes:shutil.copy2(backup/p.name,p)
 raise
print('APLICADO: nome Assistente FSJ.VM nas telas. Feche e reabra o aplicativo.')
print('Pacote Android, contas, banco e arquivos preservados.')
print('O nome do icone Android requer um novo APK assinado; este ajuste altera as telas.')
print('Backup:',backup)
