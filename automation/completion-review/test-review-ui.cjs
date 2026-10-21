const fs=require('node:fs'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
(async()=>{
 const root=fs.existsSync(__dirname+'/index.html')?__dirname:require('node:path').resolve(__dirname,'../..'),source=n=>fs.readFileSync(root+'/'+n,'utf8');
 const dom=new JSDOM(source('index.html'),{url:'https://urbanopos.github.io/Assistente.FSJ/',runScripts:'outside-only'}),w=dom.window;
 let rejected=false,posts=[],confirm=true,refreshes=0;
 const completion='13a00001-f504-456a-8d2b-987654321001';
 w.S={tasks:[{id:'task',code:'Tar - 000001',status:'Concluída'}]};
 w.editTask=id=>{w.document.getElementById('taskEditId').value=id;};
 w.clearTaskForm=()=>{w.document.getElementById('taskEditId').value='';};
 w.confirm=()=>confirm;w.save=()=>{};w.fsjAtualizarRetornos=async()=>{refreshes++;};
 w.api=async(url,opt)=>{
  const data=JSON.parse(opt.body);
  if(data.action==='completion-info')return {diaria:true,situacao:rejected?'Pendente':'Concluída',conclusoes:rejected?[]:[{id:completion,dia:'2026-10-20',registrada_em:'2026-10-20T15:00:00Z'}],revisoes:rejected?[{dia:'2026-10-20',motivo:'Revisão <b>preservada</b>',em:'2026-10-20T16:00:00Z'}]:[]};
  if(data.action==='reopen-completion'){posts.push(data);rejected=true;return {ok:true};}
  throw Error('Unexpected action');
 };
 w.eval(source('completion-review.js'));
 w.editTask('task');await new Promise(r=>setTimeout(r,0));
 assert.equal(w.document.getElementById('completionReviewControls').hidden,false);
 w.document.getElementById('cancelCompletionBtn').click();await new Promise(r=>setTimeout(r,0));assert.equal(posts.length,0);
 w.document.getElementById('completionReviewReason').value='Refazer o serviço';
 confirm=false;w.document.getElementById('cancelCompletionBtn').click();await new Promise(r=>setTimeout(r,0));assert.equal(posts.length,0);
 confirm=true;w.document.getElementById('cancelCompletionBtn').click();await new Promise(r=>setTimeout(r,0));
 assert.equal(posts.length,1);assert.equal(posts[0].conclusao_id,completion);assert.equal(posts[0].motivo,'Refazer o serviço');assert.match(posts[0].requisicao,/^[0-9a-f-]{36}$/i);assert.equal(refreshes,1);
 assert.equal(w.document.getElementById('completionReviewControls').hidden,true);
 assert.equal(w.document.querySelector('#completionReviewHistoryRows b'),null);
 assert.match(w.document.getElementById('completionReviewStatus').textContent,/Conclusão cancelada/);
 w.clearTaskForm();assert.equal(w.document.getElementById('ownerCompletionReview').hidden,true);
 // Actual task status derivation must ignore the canceled response.
 w.fsjDia=s=>String(s).slice(0,10);
 w.eval(source('index.html').match(/function fsjAplicarRetornos[\s\S]*?\n}\nasync function fsjLerRetornos/)[0].replace(/\nasync function fsjLerRetornos$/,''));
 const task={id:'t',daily:false,status:'Pendente',reopenedAt:'2026-10-20',reopenReason:'Refazer'};
 const result=w.fsjAplicarRetornos(task,[{tarefa_id:'t',tipo:'sim_cancelado',cancelado_por_revisao:'x',criado_em:'2026-10-20'}],'2026-10-20');
 assert.equal(result.status,'Pendente');assert.match(result.response,/Refazer/);
 const completed=w.fsjAplicarRetornos(task,[{tarefa_id:'t',tipo:'sim',criado_em:'2026-10-20'}],'2026-10-20');
 assert.equal(completed.status,'Concluída');
 dom.window.close();console.log('PASS: owner edit flow, reason, confirmation, selected occurrence, refresh, safe history and status');
})().catch(e=>{console.error(e);process.exitCode=1;});

