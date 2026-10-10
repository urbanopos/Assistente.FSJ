const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const fn=script.slice(script.indexOf('async function brisaPerguntar(texto)'),script.indexOf('\n\nfunction brisaMontarContextoChatGPT'));
async function run(){
let release,spoken,reads=0;const ready=new Promise(r=>release=r);const saved={};
const ctx=vm.createContext({S:{people:[],groups:[],tasks:[]},currentPage:'dashboard',brisaBotaoAtivo(){},brisaEstadoAtual(){},brisaResposta:{},navTo(){},voltarPagina(){},localStorage:{getItem:k=>saved[k]},speak:async t=>spoken=t,brisaCargaInicial:ready,brisaDadosCarregados:false,brisaInterpretar:(text,d)=>text==='oi'?{answer:'Estou aqui'}:d.carregado?(reads++,{answer:'Tarefas carregadas'}):{precisaDados:true}});
vm.runInContext(fn,ctx);
await ctx.brisaPerguntar('oi');assert.equal(spoken,'Estou aqui');
const pending=ctx.brisaPerguntar('tarefas');await Promise.resolve();assert.equal(reads,0);assert.equal(spoken,'Estou aqui');
saved.fsj_access_token='saved-session';ctx.brisaDadosCarregados=true;release();await pending;assert.equal(spoken,'Tarefas carregadas');
ctx.brisaDadosCarregados=false;await ctx.brisaPerguntar('tarefas');assert.match(spoken,/carregar os dados/);assert.equal(reads,1);
delete saved.fsj_access_token;await ctx.brisaPerguntar('tarefas');assert.match(spoken,/Neste navegador/);assert.equal(reads,1);
assert(script.includes('const brisaCargaInicial=carregarArmazenagem()'));assert(script.includes('save();brisaDadosCarregados=true'));
console.log('Sintaxe e 5 cenários aprovados: saudação imediata, espera da sessão, sessão restaurada, falha de carregamento e acesso ausente.');
}run().catch(e=>{console.error(e);process.exit(1)});