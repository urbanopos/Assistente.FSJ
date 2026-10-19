const {JSDOM}=require('jsdom'),fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
(async()=>{
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://urbanopos.github.io/Assistente.FSJ/'}),w=dom.window;
 const calls=[];Object.assign(w,{S:{tasks:[],groups:[]},uid:()=>String(w.S.tasks.length+1),api:async(path,options)=>{calls.push({path,body:options?.body&&JSON.parse(options.body)});return[{codigo_tarefa:'Tar-000001'}]},ids:t=>t.personIds,renderTargets(){},fsjTargetSelectionSync(){},save(){},render(){},navTo(){},alert(){}});
 w.eval(html.slice(html.indexOf('function fsjFrequency('),html.indexOf('async function delTask(')));
 assert.equal(w.document.querySelector('#daily'),null);
 assert.deepEqual([...w.taskFrequency.options].map(x=>x.value),['pontual','diaria','semanal','mensal','trimestral','semestral','anual']);
 for(const frequency of ['diaria','semanal','mensal','trimestral','semestral','anual','pontual']){
  w.targetBox.innerHTML='<input class="tm" type="checkbox" value="p1" checked>';
  w.taskText.value='Conferir '+frequency;w.taskFrequency.value=frequency;
  w.guardarRascunhoTarefa();w.taskText.value='';w.taskFrequency.value='pontual';w.restaurarRascunhoTarefa();
  assert.equal(w.taskFrequency.value,frequency,'rascunho');
  await w.addTask();const posted=calls.filter(x=>x.path.includes('tarefas?')).at(-1).body;
  assert.equal(posted.periodicidade,frequency);assert.equal(posted.diaria,frequency==='diaria');
  const task=w.S.tasks.at(-1);w.editTask(task.id);assert.equal(w.taskFrequency.value,frequency,'edicao');w.clearTaskForm();
 }
 w.localStorage.setItem('fsj_rascunho_tarefa_v1',JSON.stringify({text:'Legado',daily:true}));w.restaurarRascunhoTarefa();assert.equal(w.taskFrequency.value,'diaria');
 dom.window.close();console.log('PASS: sete opcoes, salvar/editar e rascunhos por periodicidade, compatibilidade diaria anterior.');
})().catch(error=>{console.error(error);process.exit(1)});
