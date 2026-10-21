const fs=require('node:fs'),vm=require('node:vm'),{stripTypeScriptTypes}=require('node:module');
const path=require('node:path'),root=fs.existsSync(__dirname+'/index.html')?__dirname:path.resolve(__dirname,'../..');
const source=file=>fs.readFileSync(file.endsWith('.ts')?(fs.existsSync(__dirname+'/'+file)?__dirname+'/'+file:root+'/supabase/functions/'+file.slice(0,-3)+'/index.ts'):root+'/'+file,'utf8');

for(const file of ['index.html','quadro.html','responder.html','supervisor.html']){
 const html=source(file);
 for(const match of html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:file});
}
for(const file of ['supervisor-view.js','daily-progress.js'])new vm.Script(source(file),{filename:file});
for(const file of ['supervisao.ts','resposta-tarefa.ts'])new vm.Script(stripTypeScriptTypes(source(file)),{filename:file});
console.log('PASS: HTML inline scripts, JS and Edge TypeScript syntax');
