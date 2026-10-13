const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const html=fs.readFileSync('index.html','utf8');
test('hash de versão normaliza apenas a declaração e confere com o arquivo publicado',()=>{
 const hash=html.match(/^const FSJ_RELEASE_HASH='([0-9a-f]{64})';$/m)?.[1];assert.ok(hash);
 const normalized=html.replace(/^const FSJ_RELEASE_HASH='[0-9a-f]{64}';$/m,"const FSJ_RELEASE_HASH='__FSJ_RELEASE_HASH__';");
 assert.equal(crypto.createHash('sha256').update(normalized).digest('hex'),hash);
 assert.match(normalized,/const normalized=html\.replace\(\/\^const FSJ_RELEASE_HASH=/);
 assert.ok(normalized.includes('"const FSJ_RELEASE_HASH=\'__FSJ_RELEASE_HASH__\';"'));
});
test('termos reservam material próprio e preservam direitos de terceiros e limites da publicação',()=>{
 const license=fs.readFileSync('LICENSE','utf8');assert.match(license,/Urbano Possidônio de Carvalho Junior/);assert.match(license,/autorização prévia e/);assert.match(license,/próprias titularidades/);assert.match(license,/visualização e fork/);
 const pkg=JSON.parse(fs.readFileSync('automation/package.json'));assert.equal(pkg.license,'UNLICENSED');assert.equal(pkg.private,true);
});
let JSDOM;try{({JSDOM}=require('jsdom'));}catch{}
test('somente o cadastro vinculado recebe identificação de Proprietário',{skip:!JSDOM},async()=>{
 const dom=new JSDOM('<div id="people"><span data-owner-person="urbano"></span><span data-owner-person="outro"></span></div><p id="ownerAccount"></p><input id="pid" value="urbano"><p id="ownerPersonStatus"></p>',{runScripts:'outside-only'}),w=dom.window;
 w.api=async()=>[{pessoa_id:'urbano',nome_titular:'Urbano Possidônio de Carvalho Junior',papel:'Proprietário'}];w.eval(fs.readFileSync('proprietario.js','utf8'));await w.fsjLoadOwnership();
 assert.match(w.document.querySelector('[data-owner-person="urbano"]').textContent,/Proprietário/);assert.equal(w.document.querySelector('[data-owner-person="outro"]').textContent,'');
 assert.equal(w.document.getElementById('ownerPersonStatus').hidden,false);w.document.getElementById('pid').value='outro';w.fsjOwnerBadges();assert.equal(w.document.getElementById('ownerPersonStatus').hidden,true);dom.window.close();
});
