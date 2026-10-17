const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {patch,install,oldCaption}=require('./install-daily-layout.cjs');
function source(){return `// FSJ_PRE_TRANSMISSION
async function revokeLive() { return 'preserved'; }
async function preview(now,text,board){
 const stamp='stamp',match=["https://urbanopos.github.io/Assistente.FSJ/quadro.html#token=abc"];
 const url=new URL(match[0]);
 ${oldCaption}
 const page={setContent:async html=>{globalThis.html=html;}};
 await page.setContent('<html>GESTÃO DE TAREFAS</html>');
 return caption;
}`;}
test('mantem hoje, altera amanha, preserva links e condicao de supervisao',async()=>{
 const original=source(),updated=patch(original);assert.equal(patch(updated),updated);
 const ctx=vm.createContext({URL,localDay:d=>d.toISOString().slice(0,10)});vm.runInContext(updated,ctx);
 const link='https://urbanopos.github.io/Assistente.FSJ/supervisor.html#token=supervisor-token';
 const old=await ctx.preview(new Date('2026-10-17T10:00Z'),'texto '+link,{responsavel:'Urbano'});
 assert.match(old,/Fazenda Sao Jose/);assert.equal(ctx.html,'<html>GESTÃO DE TAREFAS</html>');
 const next=await ctx.preview(new Date('2026-10-18T10:00Z'),'texto '+link,{responsavel:'Urbano'});
 assert.match(next,/\*CONSULTA TAREFAS\*/);assert.match(next,/\*TAREFAS DE TERCEIROS\*/);assert.ok(next.includes(link));assert.ok(next.endsWith('*ESTA MENSAGEM CANCELA AS ANTERIORES*'));
 assert.match(ctx.html,/GESTÃO DE TAREFAS 18\/10\/2026/);
 const ordinary=await ctx.preview(new Date('2026-10-18T10:00Z'),'texto',{responsavel:'Carlos'});assert.doesNotMatch(ordinary,/TAREFAS DE TERCEIROS/);
 assert.ok(updated.includes("async function revokeLive() { return 'preserved'; }"));
});
test('valida sintaxe e salva backup; rejeita versao desconhecida sem gravar',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'fsj-layout-'));try{
 const p=path.join(root,'wa.mjs');fs.writeFileSync(p,source());install(root);assert.ok(fs.readFileSync(p,'utf8').includes('FSJ_DAILY_LAYOUT_20261018'));
 const backups=fs.readdirSync(root).filter(n=>n.includes('backup-layout'));assert.equal(backups.length,1);assert.equal(fs.readFileSync(path.join(root,backups[0]),'utf8'),source());install(root);assert.equal(fs.readdirSync(root).filter(n=>n.includes('backup-layout')).length,1);
 fs.writeFileSync(p,'unexpected');assert.throws(()=>install(root));assert.equal(fs.readFileSync(p,'utf8'),'unexpected');
 }finally{fs.rmSync(root,{recursive:true});}
});
