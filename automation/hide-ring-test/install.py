"""Oculta somente o controle de teste; preserva o toque automático das chamadas."""
from pathlib import Path
import datetime,json,shutil,sys
def patch(text):
 anchor="incomingSoundButton.id='fsjEnableCallSound';"
 if 'FSJ_HIDE_RING_TEST_V1' in text:return text
 if text.count(anchor)!=1:raise ValueError('Controle de teste diferente do esperado. Nada alterado.')
 return text.replace(anchor,anchor+"/* FSJ_HIDE_RING_TEST_V1 */incomingSoundButton.hidden=true;incomingSoundButton.style.setProperty('display','none','important');incomingSoundButton.tabIndex=-1;")
def install(root):
 root=Path(root);target=root/'static/calls.js';version_path=root/'version.json'
 old=target.read_text();new=patch(old)
 if new==old:print('Botão de teste já retirado.');return
 version=json.loads(version_path.read_text());version['web_version']='sem-teste-toque-20261019-01'
 backup=root/'backups'/('sem-teste-toque-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));backup.mkdir(parents=True)
 for p in [target,version_path]:shutil.copy2(p,backup/p.name)
 try:
  for p,text in [(target,new),(version_path,json.dumps(version,ensure_ascii=False)+'\n')]:
   temp=p.with_name(p.name+'.ring.tmp');temp.write_text(text);shutil.copymode(p,temp);temp.replace(p)
 except BaseException:
  for p in [target,version_path]:shutil.copy2(backup/p.name,p)
  raise
 print('Botão Testar toque retirado. Toque automático preservado. Backup: '+str(backup))
if __name__=='__main__':install(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001')
