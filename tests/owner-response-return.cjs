const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(__dirname+'/../responder.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
const start=html.indexOf("document.getElementById('send').onclick=async()=>");
const handler=html.slice(start,html.indexOf('\nload();',start));
async function scenario({owner=true,answer='sim',ok=true,attachments=false,why='Motivo'}={}){
const dom=new JSDOM('<button id="send"></button><input type="radio" name="resposta" value="'+answer+'" checked><textarea id="why"></textarea><textarea id="missing"></textarea><input id="files" type="file"><div id="form"></div><div id="done"><p></p></div><button id="startTask"></button>');
const document=dom.window.document;document.getElementById('why').value=why;
let requests=0,refreshes=0,redirects=[],errors=[];
const ctx={document,info:{respondido:false},responseParams:new URLSearchParams(owner?'gestor=1':''),why:document.getElementById('why'),files:document.getElementById('files'),form:document.getElementById('form'),done:document.getElementById('done'),taskAnswer:{hidden:false},status:{textContent:''},token:'test-token',endpoint:'test-endpoint',FormData:dom.window.FormData,CustomEvent:dom.window.CustomEvent,location:{replace:url=>redirects.push(url)},fail:s=>errors.push(s),refreshExecution:async()=>{refreshes++},fetch:async()=>{requests++;return {ok,json:async()=>ok?{anexos_nao_salvos:attachments?['foto.jpg']:[]}:{erro:'Falha simulada'}}}};
vm.createContext(ctx);vm.runInContext(handler,ctx);await document.getElementById('send').onclick();
return {requests,refreshes,redirects,errors,ctx,document};
}
(async()=>{
for(const answer of ['sim','nao']){const r=await scenario({answer});assert.deepEqual(r.redirects,['./index.html?fsj_return=1']);assert.equal(r.requests,1);assert.equal(r.refreshes,0);await r.document.getElementById('send').onclick();assert.equal(r.requests,1);}
let r=await scenario({ok:false});assert.equal(r.redirects.length,0);assert.equal(r.ctx.info.respondido,false);assert.equal(r.document.getElementById('send').disabled,false);assert.equal(r.errors[0],'Falha simulada');
r=await scenario({answer:'nao',why:''});assert.equal(r.requests,0);assert.equal(r.redirects.length,0);
r=await scenario({answer:'nao',attachments:true});assert.equal(r.redirects.length,0);assert.match(r.ctx.status.textContent,/foto.jpg/);assert.equal(r.ctx.info.respondido,true);
r=await scenario({owner:false});assert.equal(r.redirects.length,0);assert.equal(r.ctx.done.style.display,'block');
const index=fs.readFileSync(__dirname+'/../index.html','utf8');const pos=index.indexOf("sessionStorage.setItem('fsj_app_return',JSON.stringify({page:'demandas',employee:pid");assert(pos>0);assert(pos<index.indexOf("location.assign('./responder.html#",pos));assert(index.includes("fsjRestoreFilters(state)"));
console.log('PASS: SIM/NAO confirmados retornam; erro e justificativa vazia nao retornam; anexos parciais visiveis; resposta unica; participante preservado; contexto salvo.');
})().catch(e=>{console.error(e);process.exitCode=1});
