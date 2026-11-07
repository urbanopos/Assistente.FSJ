// Regressão: contadores e links do início devem refletir a lista central em cada sincronização.
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
for(const file of ['index.html','desktop/index.html']){
 const html=fs.readFileSync(file,'utf8');
 const start=html.indexOf('async function fsjLerRegistrosPaginados(');
 const end=html.indexOf('let fsjAtualizacaoEmCurso=null;',start);
 assert(start>0&&end>start,file+': rotinas de sincronização não localizadas');
 const source=html.slice(start,end);
 const S={tasks:[]};
 const document={getElementById(id){return counters[id]||null}};
 const counters=Object.fromEntries(['ko','kc','kp','kq'].map(id=>[id,{textContent:'0'}]));
 const context={S,document,fsjDia:d=>String(d).slice(0,10),fsjAplicarRetornos:t=>t};
 vm.createContext(context);
 vm.runInContext(source,context,{filename:file});
 const old=[{id:'1',text:'Anterior',status:'Em aberto',attachments:[{name:'arquivo'}]},{id:'2',text:'Excluída',status:'Em aberto'}];
 const rows=[
  {id:'1',codigo_tarefa:'Tar-000001',descricao:'Editada',diaria:false,periodicidade:'semanal',situacao:'Concluída',grupo_id:'g1',prioridade:'normal',criada_em:'2026-11-01T10:00:00Z'},
  {id:'3',codigo_tarefa:'Tar-000003',descricao:'Nova',diaria:true,periodicidade:'diaria',situacao:'Em aberto',prioridade:'normal',criada_em:'2026-11-07T10:00:00Z'}
 ];
 const links=[{tarefa_id:'1',pessoa_id:'p1'},{tarefa_id:'1',pessoa_id:'p2'},{tarefa_id:'3',pessoa_id:'p3'}];
 const next=context.fsjReconciliarTarefas(old,rows,links,[],'2026-11-07');
 assert.deepEqual(Array.from(next,x=>x.id),['1','3'],file+': inserção/exclusão deve acompanhar o banco');
 assert.equal(next[0].text,'Editada',file+': descrição editada');
 assert.equal(next[0].status,'Concluída',file+': conclusão');
 assert.equal(next[0].groupId,'g1',file+': grupo não pode virar tarefa individual duplicada');
 assert.deepEqual(Array.from(next[0].personIds),['p1','p2'],file+': vínculos novos');
 assert.equal(next[0].attachments.length,1,file+': anexos locais preservados');
 assert.equal(next[1].code,'Tar-000003',file+': link da nova tarefa');
 S.tasks=next;context.fsjAtualizarIndicadoresIniciais();
 assert.equal(counters.ko.textContent,1,file+': contador abertas');
 assert.equal(counters.kc.textContent,1,file+': contador concluídas');
 assert.equal(counters.kp.textContent,0,file+': contador pendentes');
 assert(html.includes('S.tasks=fresh;'),file+': aplicar lista completa ao painel');
 assert(html.includes("if(currentPage==='tarefasPorSituacao')fsjRenderTarefasPorSituacao();"),file+': atualizar links por situação');
 assert(html.includes("if(currentPage==='fsjNaoCumpridas')fsjRenderNaoCumpridas();"),file+': atualizar links de não cumpridas');
 assert(html.includes("fsjLerRegistrosPaginados('/rest/v1/tarefa_responsaveis?"),file+': vínculos atuais do banco');
 const build=html.match(/const FSJ_BUILD='([^']+)'/)?.[1];
 assert.equal(build,html.match(/<meta name="fsj-build" content="([^"]+)"/)?.[1],file+': versões alinhadas');
 console.log('PASS:',file,'— inclusão, edição, exclusão, vínculos, grupo, indicadores, links e versão');
}
