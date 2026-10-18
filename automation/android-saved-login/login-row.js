/* FSJ_SAVED_LOGIN_ROW_V14 */
;(()=>{
const el=id=>document.getElementById(id),form=el('loginForm'),password=el('password'),name=el('name');
if(!form||!password||!name||el('fsjLoginActions'))return;
let remember=el('rememberLogin'),label=el('rememberLoginLabel');
if(!remember){remember=document.createElement('input');remember.type='checkbox';remember.id='rememberLogin';}
if(!label){label=document.createElement('label');label.id='rememberLoginLabel';}
label.replaceChildren(remember,document.createTextNode('Salvar senha'));label.hidden=false;label.className='check';
let show=[...form.querySelectorAll('button')].find(b=>/mostrar senha|ocultar senha/i.test(b.textContent));
if(!show){show=document.createElement('button');show.type='button';show.textContent='Mostrar senha';show.onclick=()=>{const on=password.type==='password';password.type=on?'text':'password';show.textContent=on?'Ocultar senha':'Mostrar senha';show.setAttribute('aria-pressed',String(on));};}
show.id='fsjShowLoginPassword';show.removeAttribute('style');
const submit=form.querySelector('button[type="submit"],button:not([type])');
if(!submit)return;submit.type='submit';submit.id='fsjLoginSubmit';
const row=document.createElement('div');row.id='fsjLoginActions';row.append(label,show,submit);form.append(row);
let pending=null;
function native(){return !!window.FSJAndroid?.savedLogin&&!!window.FSJAndroid?.saveLogin;}
try{remember.checked=localStorage.getItem('fsj_remember_choice')==='1';}catch{}
remember.addEventListener('change',()=>{
try{localStorage.setItem('fsj_remember_choice',remember.checked?'1':'0');}catch{}
if(!remember.checked&&native())FSJAndroid.saveLogin('','',false);
});
form.addEventListener('submit',()=>{pending={name:name.value,password:password.value,remember:remember.checked};},true);
document.addEventListener('fsj:session',async()=>{
if(!pending)return;const saved=pending;pending=null;
try{
if(native()){FSJAndroid.saveLogin(saved.name,saved.password,saved.remember);return;}
if(saved.remember&&window.PasswordCredential&&navigator.credentials?.store){await navigator.credentials.store(new PasswordCredential({id:saved.name,password:saved.password,name:saved.name}));}else if(saved.remember){throw Error('Gerenciador indisponivel');}
}catch{const status=el('status');if(status)status.textContent='Acesso realizado. O navegador nao conseguiu salvar a senha; use seu gerenciador de senhas ou o aplicativo Android atualizado.';}
});
// O bridge Android e adicionado antes da pagina; a verificacao de origem e feita no nativo.
function restore(){if(!native())return false;try{const saved=JSON.parse(FSJAndroid.savedLogin());if(saved.name&&saved.password){name.value=saved.name;password.value=saved.password;remember.checked=true;}return true;}catch{return false;}}
if(!restore())document.addEventListener('DOMContentLoaded',restore,{once:true});
})();
