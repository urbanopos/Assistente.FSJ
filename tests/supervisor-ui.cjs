const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');let JSDOM;try{({JSDOM}=require('jsdom'));}catch{}
test('Pessoas reabre atribuições, valida escopo e permite retirar a função',{skip:!JSDOM},async()=>{
 const dom=new JSDOM('<input id="pid" value="s"><input id="pSupervisor" type="checkbox"><p id="pSupervisorStatus"></p><div id="pSupervisorScopes"><div id="pSupervisedPeople"></div><div id="pSupervisedGroups"></div></div><div id="people"></div>',{runScripts:'outside-only'}),w=dom.window;
 w.S={people:[{id:'a',nick:'Carlos',active:true}],groups:[{id:'g',name:'Equipe'}]};w.esc=String;let saved;
 w.api=async(path,opt)=>{const b=JSON.parse(opt.body);if(b.action==='manager-list')return {supervisores:[{pessoa_id:'s',ativo:true,pessoas:['a'],grupos:['g']}]};saved=b;return {ok:true};};
 w.eval(fs.readFileSync('supervisor-manager.js','utf8'));await w.fsjLoadSupervisors();assert.equal(w.document.getElementById('pSupervisor').checked,true);assert.equal(w.document.querySelector('.supervised-person').checked,true);
 const config=w.fsjSupervisorPrepare('s',true);await w.fsjSupervisorSave(config);assert.equal(saved.grupos[0],'g');
 w.document.getElementById('pSupervisor').checked=false;assert.equal(w.fsjSupervisorPrepare('s',true).ativo,false);assert.equal(w.fsjSupervisorPrepare('s',false).ativo,false);
 dom.window.close();
});
test('supervisor filtra demandas, escapa conteúdo e limpa dados após revogação',{skip:!JSDOM},async()=>{
 const html=fs.readFileSync('supervisor.html','utf8'),dom=new JSDOM(html,{runScripts:'outside-only',url:'https://example.invalid/supervisor.html#token=test'}),w=dom.window;w.AbortSignal=AbortSignal;w.setInterval=()=>0;
 const data={supervisor:'Pessoa S',atualizado_em:new Date().toISOString(),pessoas:[{id:'a',nome:'Carlos'}],grupos:[{id:'g',nome:'Equipe'}],tarefas:[{id:'t',descricao:'<img src=x onerror=alert(1)>',diaria:false,situacao:'Pendente',responsaveis:[{id:'a',nome:'Carlos'}],grupos:['g'],resposta:{responsavel:'Carlos',tipo:'nao',conteudo:'Observação',criado_em:new Date().toISOString()}}]};
 w.fetch=async()=>({ok:true,json:async()=>data});w.eval(fs.readFileSync('supervisor-view.js','utf8'));await w.supervisorLoad();assert.equal(w.document.querySelectorAll('.task').length,1);assert.equal(w.document.querySelectorAll('.task img').length,0);
 w.document.getElementById('filterStatus').value='Concluída';w.supervisorRender();assert.equal(w.document.querySelectorAll('.task').length,0);
 w.fetch=async()=>({ok:false,json:async()=>({erro:'Acesso revogado'})});await w.supervisorLoad();assert.equal(w.document.querySelectorAll('.task').length,0);assert.equal(w.document.getElementById('filterPerson').options.length,1);assert.equal(w.document.getElementById('filterGroup').options.length,1);assert.match(w.document.getElementById('status').textContent,/revogado/);dom.window.close();
});
