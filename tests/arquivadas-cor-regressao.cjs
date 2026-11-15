// Teste de regressão: tarefas arquivadas nunca são urgentes/pulsantes.
// Executar com: node tests/arquivadas-cor-regressao.cjs
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const match=html.match(/function fsjTaskClass\(priority,status,running=false\)\{[^}]+\}/);
assert.ok(match,'Classificador de situação não encontrado');
const classify=vm.runInNewContext('('+match[0]+')');
for(const priority of ['urgente','prioritaria','normal']){
 for(const status of ['Arquivado','Arquivada']){
  const cls=classify(priority,status,true);
  assert.equal(cls,'fsj-task-archived',status+' / '+priority+' não pode piscar');
  assert.ok(!/urgent|priority/.test(cls),'Arquivada recebeu prioridade visual');
 }
}
assert.equal(classify('urgente','Em aberto'),'fsj-priority fsj-urgent');
assert.equal(classify('normal','Concluída'),'fsj-task-completed');
assert.match(html,/tarefaAtualizada\.status='Arquivado'/,'Estado arquivado deve prevalecer após retornos');
assert.match(html,/t\.centralStatus==='Arquivado'\|\|t\.centralStatus==='Arquivada'\?'Arquivado':t\.status/,'Exibição deve usar estado central');
assert.match(html,/\.fsj-task-number\.fsj-task-archived\{[^}]*animation:none!important/,'Arquivada precisa ter animação desativada');
console.log('OK: prioridade visual e estado central de tarefas arquivadas protegidos.');
