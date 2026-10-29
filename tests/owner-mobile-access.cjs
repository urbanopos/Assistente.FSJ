const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ownership=fs.readFileSync(path.join(root,'proprietario.js'),'utf8');
const menu=html.slice(html.indexOf('const fsjOpcoesOriginais='),html.indexOf('window.fsjSimpleGo=function'));
for(const width of [390,1280])test('titular reconhecido automaticamente mantém todas as abas em '+width+'px',async()=>{
 const dom=new JSDOM(html,{runScripts:'outside-only'}),w=dom.window;w.innerWidth=width;w.currentPage='dashboard';
 const select=w.document.getElementById('fsjSimpleSelect'),expected=[...select.options].map(o=>o.value);
 try{
  w.eval(menu);w.fsjAtualizarMenuContextual('dashboard');assert.equal(select.options.length,1);
  w.api=async()=>[{pessoa_id:'titular',nome_titular:'Urbano',papel:'Proprietário'}];w.eval(ownership);await w.fsjLoadOwnership();
  assert.equal(w.fsjOwnerVerified,true);
  for(const section of ['dashboard','novaTarefa','demandas','cadPessoas','folgasGestor']){w.fsjAtualizarMenuContextual(section);assert.deepEqual([...select.options].map(o=>o.value),expected);}
  w.api=async()=>[];await w.fsjLoadOwnership();w.fsjAtualizarMenuContextual('novaTarefa');assert.equal(w.fsjOwnerVerified,false);assert.deepEqual([...select.options].map(o=>o.value),['novaTarefa','demandas']);
 }finally{dom.window.close();}
});
const entry=fs.readFileSync(path.join(root,'fsj-owner-entry.js'),'utf8'),tick=()=>new Promise(r=>setImmediate(r));
async function entrance({authorized=false,session=true,expired=false}={}){
 const saved=new Map(session?[['fsj_access_token','test-only'],['fsj_refresh_token','test-refresh']]:[]),redirects=[],calls=[];
 const ctx={AbortSignal,location:{pathname:'/Assistente.FSJ/inicio-usuario.html',replace:x=>redirects.push(x)},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},fetch:async(url,init)=>{
  calls.push(url);if(url.includes('/auth/v1/token'))return Response.json({access_token:'restored',refresh_token:'rotated'});
  if(expired&&init.headers.Authorization==='Bearer test-only')return new Response('',{status:401});
  return Response.json(authorized?[{pessoa_id:'titular'}]:[]);
 }};
 vm.runInNewContext(entry,ctx);await tick();await tick();return {redirects,calls,saved};
}
test('entrada individual abre painel completo somente para sessão titular validada',async()=>{
 assert.deepEqual((await entrance({authorized:true})).redirects,['./index.html?fsj_perfil=proprietario']);
 assert.deepEqual((await entrance()).redirects,[]);
 const noSession=await entrance({authorized:true,session:false});assert.deepEqual(noSession.redirects,[]);assert.equal(noSession.calls.length,0);
});
test('sessão expirada é recuperada antes de reconhecer o titular',async()=>{
 const r=await entrance({authorized:true,expired:true});assert.equal(r.saved.get('fsj_access_token'),'restored');assert.equal(r.saved.get('fsj_refresh_token'),'rotated');assert.equal(r.redirects.length,1);
});
