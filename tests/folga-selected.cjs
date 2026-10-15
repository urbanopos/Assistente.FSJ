process.chdir(require('node:path').resolve(__dirname,'..'));
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('folga salva exibe só a data escolhida; opções voltam apenas ao alterar',()=>{
 function element(tag){return {tag,children:[],append(...xs){this.children.push(...xs);},replaceChildren(){this.children=[];},setAttribute(){}};}
 const box=element('section'),context=vm.createContext({document:{getElementById:()=>box,createElement:element,createTextNode:text=>({text})}});
 const src=fs.readFileSync('weekly-off-employee.js','utf8');vm.runInContext(src.slice(0,src.lastIndexOf('carregarFolgaEmpregado();document')),context);
 vm.runInContext("folgaAgenda={dia:'2026-10-18',semana:'2026-10-12',hoje:'2026-10-15',bloqueada_gestor:false};renderFolga()",context);
 assert(!box.children.some(e=>e.className==='folga-calendar'));assert(box.children.some(e=>e.id==='folgaStatus'&&e.textContent.includes('18/10')));
 box.children.find(e=>e.tag==='button').onclick();const grid=box.children.find(e=>e.className==='folga-calendar');assert.equal(grid.children.length,7);
});
test('folga definida pelo gestor não oferece outras opções',()=>{
 const box={children:[],append(...xs){this.children.push(...xs);},replaceChildren(){this.children=[];}};
 const c=vm.createContext({document:{getElementById:()=>box,createElement:tag=>({tag,children:[],append(...xs){this.children.push(...xs);},setAttribute(){}})}});
 const src=fs.readFileSync('weekly-off-employee.js','utf8');vm.runInContext(src.slice(0,src.lastIndexOf('carregarFolgaEmpregado();document')),c);
 vm.runInContext("folgaAgenda={dia:'2026-10-18',semana:'2026-10-12',hoje:'2026-10-15',bloqueada_gestor:true};renderFolga()",c);
 assert(!box.children.some(e=>e.tag==='button'||e.className==='folga-calendar'));
});
