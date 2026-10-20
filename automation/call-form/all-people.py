from pathlib import Path
import sys,datetime,shutil,os,subprocess
MARK='FSJ_CALL_ALL_PEOPLE_V1'
OLD="const roster=users.filter(p=>p.status==='active'&&p.id!==u.id).map(p=>{const linked=directory.find(d=>d.active&&d.user_id===p.id);return {id:linked?'p:'+linked.person_id:p.id,uid:p.id,name:linked?.name||p.display_name||p.name};});"
NEW="""/* FSJ_CALL_ALL_PEOPLE_V1 */
  const roster=directory.map(p=>({id:'p:'+p.person_id,uid:p.user_id||'p:'+p.person_id,name:p.name+(!p.active?' · cadastro inativo':p.videos_chamadas!==true?' · sem autorização':''),disabled:!p.active||p.videos_chamadas!==true}));
  if(!directory.length)say('Aguardando a lista central de pessoas. Atualize os participantes.');"""
def patch(s,c,a):
 if MARK in c:raise SystemExit('Lista central já instalada. Atualize com Ctrl+F5.')
 if c.count(OLD)!=1:raise SystemExit('Código de chamada diferente do esperado. Nada alterado.')
 c=c.replace(OLD,NEW).replace('input.checked=chosen.has(p.uid);','input.disabled=!!p.disabled;input.checked=!p.disabled&&chosen.has(p.uid);')
 old="'active':p.get('ativo') is True} for p in snap.get('people',[])"
 if s.count(old)!=1:raise SystemExit('Diretório central diferente do esperado. Nada alterado.')
 s=s.replace(old,"'active':p.get('ativo') is True,'videos_chamadas':p.get('videos_chamadas') is True} for p in snap.get('people',[])")
 old="'active':p['active'],'user_id':"
 if s.count(old)!=1:raise SystemExit('Lista central diferente do esperado. Nada alterado.')
 s=s.replace(old,"'active':p['active'],'videos_chamadas':p['videos_chamadas'],'user_id':")
 old="new Option((x.checked?'✓ ':'')+x.parentElement.textContent.trim(),x.value)"
 if a.count(old)!=1:raise SystemExit('Instale primeiro o formulário de tela única. Nada alterado.')
 a=a.replace(old,"Object.assign(new Option((x.checked?'✓ ':'')+x.parentElement.textContent.trim(),x.value),{disabled:x.disabled})")
 a=a.replace('if(input){input.checked=!input.checked;','if(input&&!input.disabled){input.checked=!input.checked;')
 compile(s,'server.py','exec');return s,c,a
if __name__=='__main__':
 root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');files=[root/'server.py',root/'static/calls.js',root/'static/app.js'];new=patch(*(p.read_text(encoding='utf-8') for p in files))
 b=root/'backups'/('lista-pessoas-chamada-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True)
 for p in files:shutil.copy2(p,b/p.name)
 try:
  for p,s in zip(files,new):
   t=p.with_suffix('.lista.tmp');t.write_text(s,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
  subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
  subprocess.run(['systemctl','--user','is-active','--quiet','fsj-reserva.service'],check=True)
 except Exception:
  for p in files:shutil.copy2(b/p.name,p)
  subprocess.run(['systemctl','--user','restart','fsj-reserva.service']);raise
 print('INSTALADO: seleção com todas as pessoas do cadastro central. Inativas ou sem autorização identificadas e indisponíveis para chamada.')
 print('Backup:',b)
 print('Atualize com Ctrl+F5 e escolha Chamadas em O que deseja fazer?.')
