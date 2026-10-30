const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const entry=fs.readFileSync(path.join(root,'fsj-owner-entry.js'),'utf8'),tick=()=>new Promise(r=>setImmediate(r));
async function entrance({authorized=false,session=true,expired=false,hash='',search=''}={}){
 const saved=new Map(session?[['fsj_access_token','test-only'],['fsj_refresh_token','test-refresh']]:[]),redirects=[],calls=[];
 const ctx={AbortSignal,URLSearchParams,location:{pathname:'/Assistente.FSJ/inicio-usuario.html',hash,search,replace:x=>redirects.push(x)},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},fetch:async(url,init)=>{
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

test('link do destinatário prevalece sobre sessão do proprietário, inclusive inválido',async()=>{
 for(const params of [{hash:'#token=11111111-1111-4111-8111-111111111111'},{search:'?token=11111111-1111-4111-8111-111111111111'},{hash:'#token=invalido'},{hash:'#token='}]){
  const r=await entrance({authorized:true,...params});
  assert.deepEqual(r.redirects,[]);assert.equal(r.calls.length,0);
  assert.equal(r.saved.get('fsj_access_token'),'test-only');
 }
});
