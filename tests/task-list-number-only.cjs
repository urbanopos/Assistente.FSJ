const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
test('listas mostram somente numero e detalhe preserva descricao sem HTML ou pulsacao',()=>{
 const dom=new JSDOM('<!doctype html><button id="origin">Lista</button>',{runScripts:'outside-only'}),w=dom.window;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.eval(fs.readFileSync('task-list-ui.js','utf8'));
 w.fsjExecucoes=[];w.fsjTaskClass=()=> 'fsj-priority fsj-urgent';w.esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const html=fs.readFileSync('index.html','utf8');w.eval(html.slice(html.indexOf('function fsjTaskName('),html.indexOf("document.addEventListener('click',event=>")));
 const task={id:'task-17',code:'Tar-000017',text:'<img src=x> Descrição e condições completas',priority:'urgente',status:'Em aberto'};
 const holder=w.document.createElement('div');holder.innerHTML=w.fsjTaskName(task);assert.equal(holder.textContent,'Tar - 000017');assert.equal(holder.querySelector('button').classList.contains('fsj-urgent'),true);assert.equal(holder.innerHTML.includes('Descrição'),false);
 w.fsjOpenTaskDetails(task.code,task.text,'Responsável: Regina');const detail=w.document.getElementById('fsj-task-detail');assert.equal(detail.open,true);assert.equal(detail.querySelector('#fsj-task-detail-description').textContent,task.text);assert.equal(detail.querySelector('section img'),null);assert.equal(detail.querySelector('.fsj-urgent'),null);detail.querySelector('button').click();assert.equal(detail.open,false);dom.window.close();
});
test('supervisao inclui numero somente nas tarefas autorizadas pelo RPC',async()=>{
 const vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module');let handler;const calls=[];
 const context={Deno:{env:{get:k=>k==='SUPABASE_URL'?'https://db.invalid':'test-key'},serve:fn=>handler=fn},Response,AbortSignal,console,fetch:async(url)=>{calls.push(url);return new Response(JSON.stringify(url.includes('rpc/')?{tarefas:[{id:'authorized-task',descricao:'Texto completo'}]}:[{id:'authorized-task',codigo_tarefa:'Tar-000017',prioridade:'urgente'}]));}};
 vm.runInNewContext(stripTypeScriptTypes(fs.readFileSync('supabase/functions/supervisao/index.ts','utf8')),context);
 const result=await handler(new Request('https://test.invalid',{method:'POST',headers:{origin:'https://urbanopos.github.io'},body:JSON.stringify({action:'demands',token:'00000000-0000-4000-8000-000000000017'})}));
 assert.equal(result.status,200);const data=await result.json();assert.equal(data.tarefas.length,1);assert.equal(data.tarefas[0].codigo_tarefa,'Tar-000017');assert.match(decodeURIComponent(calls[1]),/id=in\.\("authorized-task"\)/);assert.match(calls[1],/select=id,prioridade,codigo_tarefa/);
});
