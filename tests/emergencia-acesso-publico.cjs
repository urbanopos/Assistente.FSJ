const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||'index.html','utf8'),calls=[];
const fn=html.slice(html.indexOf('function fsjAbrirDisparoEmergencial'),html.indexOf('function fsjAcessoEmergencial'));
for(const userAgent of ['Windows Desktop','Android Celular']){
const ctx={window:{open:(...args)=>calls.push(args)},navigator:{userAgent}};vm.createContext(ctx);vm.runInContext(fn,ctx);ctx.fsjAbrirDisparoEmergencial();}
for(const call of calls){assert.equal(call[0],'https://urbanopos.github.io/Assistente.FSJ/?fsj_acao=disparo-emergencial');assert.equal(call[1],'_blank');assert(call[2].includes('noopener'));}
assert(html.includes('id="fsjHomeEmergencyButton" onclick="fsjAbrirDisparoEmergencial()"'));
assert(html.includes("if(id==='disparoEmergencia'){fsjAbrirDisparoEmergencial();return;}"));
console.log('PASS: botão e menu usam o acesso público em outra aba no desktop e celular.');