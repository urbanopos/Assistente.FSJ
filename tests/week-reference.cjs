const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),{JSDOM}=require('jsdom');
function fixture(saved){
 const dom=new JSDOM('<input id="folgasSemana" type="date"><p id="folgasStatus"></p><p id="folgasResumo"></p><select id="folgasPessoaSelect"></select><section id="folgasPessoaDados"><h3 id="folgasPessoaNome"></h3><p id="folgasPessoaSituacao"></p><p id="folgasPeriodo"></p><div id="folgasLista"></div><div id="feriadosLista"></div><pre id="folgasHistorico"></pre></section>',{url:'https://fsj.test',runScripts:'outside-only'}),w=dom.window;
 let now=Date.parse('2026-10-19T02:59:59Z'),timer,delay,fail=false;
 w.Date=class extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}};
 w.setTimeout=(fn,ms)=>{timer=fn;delay=ms;return 1};w.clearTimeout=()=>{};w.AbortSignal=AbortSignal;w.recuperarAcessoGestor=async()=> 'test';w.S={people:[]};w.esc=String;w.fsjData=String;
 if(saved)w.localStorage.setItem('fsj_folgas_semana_referencia',JSON.stringify(saved));
 const requests=[];w.fetch=async(url,opt)=>{const body=JSON.parse(opt.body);requests.push(body);return {ok:!fail,json:async()=>fail?{erro:'Falha teste'}:{semana:w.folgaSegunda(body.semana),folgas:[],feriados:[],decisoes:[],historico:[]}};};
 w.eval(fs.readFileSync('weekly-off-manager.js','utf8'));
 return {dom,w,requests,get delay(){return delay},advance:ms=>now+=ms,tick:()=>timer(),fail:()=>fail=true,saved:()=>JSON.parse(w.localStorage.getItem('fsj_folgas_semana_referencia'))};
}
test('atualizar mantém semana confirmada e restaura ao reabrir durante o mesmo ciclo',async()=>{
 const f=fixture();f.w.document.getElementById('folgasSemana').value='2026-10-28';await f.w.carregarFolgas();assert.equal(f.w.document.getElementById('folgasSemana').value,'2026-10-26');assert.deepEqual(f.saved(),{ciclo:'2026-10-12',semana:'2026-10-26'});const reopened=fixture(f.saved());assert.equal(reopened.w.document.getElementById('folgasSemana').value,'2026-10-26');f.dom.window.close();reopened.dom.window.close();
});
test('segunda 00h de Pernambuco muda referencia, consulta nova semana e preserva domingo ate a virada',async()=>{
 const f=fixture({ciclo:'2026-10-12',semana:'2026-10-26'});assert.equal(f.delay,1000);assert.equal(f.w.folgasVirarSemana(),false);f.advance(1000);f.tick();await new Promise(setImmediate);assert.equal(f.w.document.getElementById('folgasSemana').value,'2026-10-19');assert.equal(f.requests.at(-1).semana,'2026-10-19');assert.equal(f.saved().ciclo,'2026-10-19');f.dom.window.close();
});
test('falha de consulta não substitui referencia salva; selecao de ciclo antigo nao e restaurada',async()=>{
 const f=fixture({ciclo:'2026-10-12',semana:'2026-10-12'});f.w.document.getElementById('folgasSemana').value='2026-11-02';f.fail();await f.w.carregarFolgas();assert.equal(f.saved().semana,'2026-10-12');const old=fixture({ciclo:'2026-10-05',semana:'2026-10-26'});assert.equal(old.w.document.getElementById('folgasSemana').value,'2026-10-12');f.dom.window.close();old.dom.window.close();
});
