#!/usr/bin/env python3
import pathlib, sys, datetime, shutil, subprocess, os
BACKEND="   # FSJ_PRIMEIRA_SENHA_V1\n   if u and u['role']!='owner' and u['status']=='approved' and not u['hash']:\n    check_password(password)\n    if not u['activation_expires'] or u['activation_expires']<time.time():\n     return self.reply(403,{'error':'Autorizacao expirada. Procure o Proprietario.'})\n    if 'confirm_password' not in d:\n     return self.reply(obj={'confirm_password_required':True,'name':u['name']})\n    confirmation=d.get('confirm_password')\n    if not isinstance(confirmation,str) or not hmac.compare_digest(password.encode(),confirmation.encode()):\n     return self.reply(400,{'error':'As senhas nao conferem.'})\n    with db() as c:\n     c.execute('BEGIN IMMEDIATE')\n     current=c.execute('SELECT * FROM users WHERE id=?',(u['id'],)).fetchone()\n     if not current or current['status']!='approved' or current['hash'] or not current['activation_expires'] or current['activation_expires']<time.time():\n      return self.reply(409,{'error':'Cadastro alterado. Volte a tela de entrada.'})\n     salt=secrets.token_hex(16)\n     c.execute(\"UPDATE users SET hash=?,salt=?,status='active',activation_hash=NULL,activation_expires=NULL WHERE id=?\",(password_hash(password,salt),salt,u['id']))\n     audit(c,None,u['id'],'password-created-login-confirmation')\n    return self.set_session(u['id'])\n"
FRONTEND="/* FSJ_PRIMEIRA_SENHA_V1 */\nlet fsjPrimeiraSenha=null;\nfunction fsjConfirmarPrimeiraSenha(name,password){\nfsjPrimeiraSenha={name,password};\nlet card=$('fsjConfirmacaoSenha');\nif(!card){\ncard=document.createElement('section');card.id='fsjConfirmacaoSenha';card.className='card';\ncard.style.cssText='order:-1;flex:1;min-height:0;overflow:auto';\ncard.innerHTML='<h2>Confirme sua senha</h2><form id=\"fsjConfirmacaoForm\"><label>Login<input id=\"fsjConfirmacaoLogin\" readonly autocomplete=\"username\"></label><label>Confirmar senha<input id=\"fsjConfirmacaoValor\" type=\"password\" minlength=\"10\" maxlength=\"200\" autocomplete=\"new-password\" required></label><button type=\"button\" id=\"fsjVerConfirmacao\" aria-pressed=\"false\">Mostrar senha</button><button type=\"submit\">Confirmar e entrar</button><button type=\"button\" id=\"fsjCancelarConfirmacao\">Voltar</button><p id=\"fsjConfirmacaoErro\" role=\"alert\"></p></form>';\n$('login').insertAdjacentElement('afterend',card);\n$('fsjVerConfirmacao').onclick=()=>{const input=$('fsjConfirmacaoValor'),show=input.type==='password';input.type=show?'text':'password';$('fsjVerConfirmacao').textContent=show?'Ocultar senha':'Mostrar senha';$('fsjVerConfirmacao').setAttribute('aria-pressed',String(show));};\n$('fsjCancelarConfirmacao').onclick=()=>{fsjPrimeiraSenha=null;$('fsjConfirmacaoValor').value='';card.hidden=true;$('login').hidden=false;$('password').value='';};\n$('fsjConfirmacaoForm').onsubmit=async e=>{\ne.preventDefault();const pending=fsjPrimeiraSenha;if(!pending)return;\nconst value=$('fsjConfirmacaoValor').value;\nif(value!==pending.password){$('fsjConfirmacaoErro').textContent='As senhas nao conferem. Digite novamente.';return;}\nconst button=e.target.querySelector('[type=\"submit\"]');button.disabled=true;\ntry{\nawait api('/api/login',{name:pending.name,password:pending.password,confirm_password:value});\nfsjPrimeiraSenha=null;$('fsjConfirmacaoValor').value='';$('password').value='';card.hidden=true;\nawait enter();status('Senha criada. Acesso autorizado.');\n}catch(error){$('fsjConfirmacaoErro').textContent=error.message;}finally{button.disabled=false;}\n};\n}\n$('login').hidden=true;$('request').hidden=true;$('androidDownload').hidden=true;card.hidden=false;\n$('fsjConfirmacaoLogin').value=name;$('fsjConfirmacaoValor').value='';$('fsjConfirmacaoErro').textContent='';$('fsjConfirmacaoValor').focus();\n}\n$('loginForm').onsubmit=async e=>{\ne.preventDefault();const button=e.target.querySelector('button[type=\"submit\"],button:not([type])');if(button)button.disabled=true;\ntry{\nconst name=$('name').value,password=$('password').value;\nconst result=await api('/api/login',{name,password});\nif(result.confirm_password_required){$('password').value='';fsjConfirmarPrimeiraSenha(result.name,password);return;}\n$('password').value='';await enter();status('');\n}catch(error){status(error.message);}finally{if(button)button.disabled=false;}\n};\n"
def install(root, restart=True):
 root=pathlib.Path(root).resolve()
 paths=[root/'server.py',root/'static/app.js']
 old=[p.read_text() for p in paths]
 if all('FSJ_PRIMEIRA_SENHA_V1' in t for t in old):
  print('Fluxo ja instalado.');return
 if any('FSJ_PRIMEIRA_SENHA_V1' in t for t in old):raise SystemExit('Instalacao parcial. Nada alterado.')
 anchor="   # Execute the same slow hash for unknown and inactive users."
 if old[0].count(anchor)!=1:raise SystemExit('Servidor diferente do esperado. Nada alterado.')
 candidates=[l for l in old[1].splitlines(keepends=True) if "loginForm" in l and ".onsubmit=" in l and "/api/login" in l]
 if len(candidates)!=1:raise SystemExit('Formulario diferente do esperado. Nada alterado.')
 new=[old[0].replace(anchor,BACKEND+anchor,1),old[1].replace(candidates[0],FRONTEND+"\n",1)]
 compile(new[0],str(paths[0]),'exec')
 backup=root/'backups'/('primeira-senha-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
 backup.mkdir(parents=True)
 for p in paths:shutil.copy2(p,backup/p.name)
 try:
  for p,t in zip(paths,new):
   tmp=p.with_name(p.name+'.primeira-senha.tmp');tmp.write_text(t);shutil.copymode(p,tmp);os.replace(tmp,p)
  if restart:subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
 except BaseException:
  for p in paths:shutil.copy2(backup/p.name,p)
  if restart:subprocess.run(['systemctl','--user','restart','fsj-reserva.service'])
  raise
 print('INSTALADO: login e senha desejada, confirmar senha e entrar.')
 print('Contas, senhas existentes e registros preservados. Backup:',backup)
if __name__=='__main__':install(sys.argv[1] if len(sys.argv)>1 else str(pathlib.Path.home()/'fsj-video-v001'))
