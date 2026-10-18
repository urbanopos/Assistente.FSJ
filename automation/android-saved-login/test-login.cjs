const {JSDOM}=require('jsdom'),assert=require('assert/strict'),fs=require('fs');
const script=fs.readFileSync(__dirname+'/login-row.js','utf8');
const dom=new JSDOM('<form id="loginForm"><label>Usuario<input id="name"></label><label>Senha<input id="password" type="password"><button type="button" id="oldShow">Mostrar senha</button></label><label hidden id="rememberLoginLabel"><input id="rememberLogin" type="checkbox">Salvar acesso</label><button>Entrar</button></form><p id="status"></p>',{runScripts:'outside-only',url:'https://192.168.1.114:8443/'});
const w=dom.window,saves=[];w.FSJAndroid={savedLogin:()=>JSON.stringify({name:'regina',password:'SenhaDeTeste123'}),saveLogin:(...args)=>saves.push(args)};
w.document.getElementById('oldShow').onclick=()=>{w.document.getElementById('password').type='text';};
w.eval(script);const el=id=>w.document.getElementById(id);
assert.equal(el('name').value,'regina');assert.equal(el('password').value,'SenhaDeTeste123');assert(el('rememberLogin').checked);
const row=el('fsjLoginActions');for(const id of ['rememberLoginLabel','fsjShowLoginPassword','fsjLoginSubmit'])assert.equal(el(id).parentNode,row);
assert.equal(row.children.length,3);assert.equal(el('fsjLoginSubmit').type,'submit');el('fsjShowLoginPassword').click();assert.equal(el('password').type,'text');
el('loginForm').addEventListener('submit',e=>e.preventDefault());el('loginForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(saves.length,0); // nao salva antes de autenticar
w.document.dispatchEvent(new w.Event('fsj:session'));assert.deepEqual(saves[0],['regina','SenhaDeTeste123',true]);
el('rememberLogin').checked=false;el('rememberLogin').dispatchEvent(new w.Event('change'));assert.deepEqual(saves[1],['','',false]);
assert.equal(w.localStorage.getItem('fsj_remember_choice'),'0');for(let i=0;i<w.localStorage.length;i++)assert(!w.localStorage.getItem(w.localStorage.key(i)).includes('SenhaDeTeste123'));
w.eval(script);assert.equal(w.document.querySelectorAll('#fsjLoginActions').length,1);
console.log('PASS: linha unica, restaurar credenciais, salvar somente apos login, desmarcar apaga, senha fora do localStorage, sem duplicacao.');w.close();
