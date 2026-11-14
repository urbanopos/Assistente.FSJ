const fs=require('node:fs');
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('Desktop mantém contrato de inativação de grupos e histórico',()=>{
 const html=read('index.html');
 assert.match(html,/async function fsjExcluirGrupoNaPessoas\(\)/);
 assert.match(html,/async function delGroup\(id\)/);
 assert.match(html,/ativo:false,excluido_em/);
 assert.match(html,/S\.groups\.filter\(g=>g\.ativo!==false\)/);
 assert.doesNotMatch(html,/Exclusão bloqueada: existem tarefas vinculadas ao grupo/);
});
test('Interface celular e desktop existem independentemente',()=>{
 assert.ok(fs.existsSync(path.join(root,'index.html')));
 assert.ok(fs.existsSync(path.join(root,'celular','interface.min.js')));
 assert.ok(fs.existsSync(path.join(root,'celular','proprietario.min.js')));
});
test('Simulador visitante permanece separado',()=>{
 const html=read('visitante.html');
 assert.match(html,/visitante\/simulador\.min\.js/);
 assert.ok(fs.existsSync(path.join(root,'visitante','simulador.min.js')));
});
test('Contrato de arquitetura está versionado',()=>{
 const c=read('docs/CONTRATO-ARQUITETURA-FSJ.md');
 for(const term of ['layouts independentes','Supabase','histórica','Celular','Desktop'])assert.ok(c.includes(term),term);
});
