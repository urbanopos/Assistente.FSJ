const {JSDOM}=require('jsdom');
const fs=require('fs'),assert=require('node:assert/strict');const js=fs.readFileSync(__dirname+'/auto-login.js','utf8');
async function run({saved={name:'urbano',password:'SenhaTeste123'},status=401}={}){
 const dom=new JSDOM('<form id="loginForm"><input id="name"><input id="password"><input id="rememberLogin" type="checkbox"><button>Entrar</button></form><div id="content" hidden></div><button id="logout">Sair</button><form id="createPasswordForm"><input id="createPassword"><input id="repeatPassword"><button>Criar</button></form>',{runScripts:'outside-only',url:'https://192.168.77.2:8443/'});
 const w=dom.window,saves=[];let submitted=0;w.fetch=async()=>({ok:status===200,status});w.FSJAndroid={savedLogin:()=>JSON.stringify(saved),saveLogin:(...a)=>saves.push(a)};w.document.getElementById('loginForm').addEventListener('submit',e=>{e.preventDefault();submitted++});w.eval(js);await new Promise(r=>setTimeout(r,20));return{w,saves,get submitted(){return submitted},dom};
}
(async()=>{
 let t=await run();assert.equal(t.submitted,1);assert.equal(t.w.document.getElementById('name').value,'urbano');t.w.eval(js);assert.equal(t.submitted,1);t.dom.window.close();
 for(const options of [{saved:{}},{status:200},{status:503}]){t=await run(options);assert.equal(t.submitted,0);t.dom.window.close();}
 t=await run();const el=id=>t.w.document.getElementById(id);el('createPassword').value=el('repeatPassword').value='NovaSenha123';el('createPasswordForm').addEventListener('submit',e=>e.preventDefault());el('createPasswordForm').dispatchEvent(new t.w.Event('submit',{cancelable:true}));assert.equal(t.saves.length,0);t.w.document.dispatchEvent(new t.w.CustomEvent('fsj:session',{detail:{name:'regina'}}));assert.deepEqual(t.saves[0],['regina','NovaSenha123',true]);el('logout').click();assert.deepEqual(t.saves[1],['','',false]);t.dom.window.close();console.log('PASS: entrada automatica uma vez, sessao existente preservada, sem repeticao em falha, primeira senha salva apos autenticacao, Sair limpa acesso.');
})().catch(e=>{console.error(e);process.exit(1)});
