const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'responder.html'),'utf8');
const tick=()=>new Promise(r=>setImmediate(r));
async function setup({stale=false,owner=false,ownerOwn=false,failSubmit=false,visitor=false}={}){
 const dom=new JSDOM(html,{runScripts:'outside-only',url:'https://urbanopos.github.io/Assistente.FSJ/responder.html#token=00000000-0000-4000-8000-000000000061'}),w=dom.window;
 w.setInterval=()=>0;w.Headers=Headers;let execution=null,responded=false;const calls=[];
 w.fetch=async(url,opt={})=>{
  if(String(url).startsWith('./responder.html?'))return {ok:true,text:async()=>html};
  const body=opt.body instanceof w.FormData?Object.fromEntries(opt.body.entries()):JSON.parse(opt.body||'{}');
  calls.push(body);
  if(body.action==='diagnostic')return {ok:owner,json:async()=>({diagnostico:owner,propria_tarefa:ownerOwn})};
  if(body.action==='start')execution={estado:'em_andamento',iniciado_em:'2026-10-29T10:00:00Z',retomado_em:'2026-10-29T10:00:00Z'};
  if(body.action==='suspend')execution={...execution,estado:'suspensa',suspenso_em:'2026-10-29T10:05:00Z'};
  if(body.action==='submit'){
   if(failSubmit){failSubmit=false;return {ok:false,json:async()=>({erro:'Falha simulada. Tente novamente.'})};}
   responded=true;execution={...execution,estado:body.resposta==='sim'?'concluida':'suspensa'};
   return {ok:true,json:async()=>({ok:true})};
  }
  return {ok:true,json:async()=>body.action==='detail'?{tarefa:'Teste local',responsavel:'Pessoa fictícia',dia:'2026-10-29',respondido:responded,visitante:visitor,execucao:execution}:{execucao:execution,suspensas:[]}};
 };
 if(stale||owner){w.localStorage.setItem('fsj_access_token','sessao-ficticia');w.eval(fs.readFileSync(path.join(root,'fsj-diagnostico-proprietario.js'),'utf8'));}
 for(const script of w.document.querySelectorAll('script:not([src])'))w.eval(script.textContent);
 await tick();await tick();return {dom,w,calls,el:id=>w.document.getElementById(id)};
}
test('iniciar, suspender, retomar e concluir SIM registram as ações corretas',async()=>{
 const {dom,w,calls,el}=await setup();try{
  assert.equal(el('answerYes').disabled,true);await el('startTask').onclick();
  assert.equal(el('answerYes').disabled,false);assert.equal(el('send').disabled,true);
  await el('suspendTask').onclick();assert.equal(el('startTask').textContent,'Retomar tarefa');
  await el('startTask').onclick();await el('answerYes').onclick();await tick();
  const writes=calls.filter(x=>['start','suspend','submit'].includes(x.action));
  assert.deepEqual(writes.map(x=>x.action),['start','suspend','start','submit']);
  assert.equal(writes[3].resposta,'sim');assert.equal(writes[3].justificativa,'');
  assert.equal(el('done').style.display,'block');
 }finally{dom.window.close();}
});
test('NÃO exige justificativa e preserva o texto após erro para nova tentativa',async()=>{
 const {dom,calls,el}=await setup({failSubmit:true});try{
  await el('startTask').onclick();el('answerNo').onclick();await el('send').onclick();
  assert.equal(calls.filter(x=>x.action==='submit').length,0);
  el('why').value='Chuva impossibilitou a execução';el('missing').value='Providenciar cobertura';
  await el('send').onclick();assert.match(el('status').textContent,/Falha simulada/);
  assert.equal(el('send').disabled,false);assert.equal(el('why').value,'Chuva impossibilitou a execução');
  await el('send').onclick();assert.equal(calls.filter(x=>x.action==='submit').length,2);
  assert.equal(calls.at(-1).action==='detail'||calls.at(-1).resposta==='nao',true);
  const submission=calls.find(x=>x.action==='submit');assert.equal(submission.resposta,'nao');assert.equal(submission.itens_faltantes,'Providenciar cobertura');
 }finally{dom.window.close();}
});
test('sessão antiga não bloqueia o token de execução do funcionário',async()=>{
 const {dom,calls,el}=await setup({stale:true});try{
  el('startTask').click();await tick();assert(calls.some(x=>x.action==='start'));
  el('answerYes').click();await tick();assert(calls.some(x=>x.action==='submit'));
 }finally{dom.window.close();}
});
test('titular reconhecido em tarefa própria inicia e conclui sem desbloqueio manual',async()=>{
 const {dom,w,calls,el}=await setup({owner:true,ownerOwn:true});try{
  assert.equal(w.document.documentElement.dataset.fsjOwnerMode,'unlocked');
  el('startTask').click();await tick();el('answerYes').click();await tick();
  assert(calls.some(x=>x.action==='start'));assert(calls.some(x=>x.action==='submit'));
 }finally{dom.window.close();}
});
test('Proprietário permanece em diagnóstico até desbloquear; visitante não grava',async()=>{
 const ctx=await setup({owner:true});try{
  ctx.el('startTask').click();await tick();assert(!ctx.calls.some(x=>x.action==='start'));
  ctx.el('fsjOwnerDiagnostic').querySelector('button').click();ctx.el('startTask').click();await tick();assert(ctx.calls.some(x=>x.action==='start'));
 }finally{ctx.dom.window.close();}
 const visitor=await setup({visitor:true});try{await visitor.el('startTask').onclick();assert(!visitor.calls.some(x=>x.action==='start'));}finally{visitor.dom.window.close();}
});

