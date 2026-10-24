const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const s=scripts.find(s=>s.includes('function brisaInterpretar'));
assert(s,'Interpretador existente localizado');
assert.match(html,/<b>MarIA<\/b>/);assert.match(html,/Olá, sou MarIA/);assert.match(html,/aria-label="Abrir MarIA"/);
assert.match(html,/src="brisa-avatar.webp"/);assert(!/\bBrisa\b/.test(html),'Rótulos com nome antigo removidos');
assert.match(s,/Sou a MarIA/);assert.match(s,/Você é MarIA/);
const ctx=vm.createContext({});vm.runInContext(s.slice(s.indexOf('function brisaNormalizar'),s.indexOf('async function brisaPerguntar')),ctx);
const data={carregado:true,page:'dashboard',people:[{id:'1',name:'Carlos',nick:'Carlos'}],groups:[],tasks:[{id:'t1',text:'Cuidar das aves',personIds:['1'],status:'Em aberto'}]};
for(const name of ['MarIA','Maria','maria','Brisa']){
 assert.equal(ctx.brisaInterpretar(name+', abra Pessoas',data).page,'cadPessoas');
 assert.match(ctx.brisaInterpretar('oi '+name,data).answer,/Estou aqui/);
}
assert.match(ctx.brisaResponderLocal('oi',data),/Sou a MarIA/);
assert.match(ctx.brisaInterpretar('MarIA, tarefas de Carlos',data).answer,/Cuidar das aves/);
assert(!ctx.brisaInterpretar('MarIA, tarefas pendentes',{...data,carregado:false}).answer.includes('Cuidar das aves'));
console.log('PASS: identidade MarIA, voz, contexto, comandos, alias e acesso aos dados preservados.');
