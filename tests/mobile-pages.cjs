const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
const script=fs.readFileSync('mobile-pages.js','utf8');
function fixture(html,manager=false,url='https://test.invalid/'){
 const dom=new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url}),w=dom.window;let mobile=true,frames=0;
 w.matchMedia=()=>({get matches(){return mobile},addEventListener(){}});
 w.HTMLElement.prototype.getClientRects=function(){return this.hidden||this.classList.contains('hidden')?[]:[this.getBoundingClientRect()]};
 w.HTMLElement.prototype.getBoundingClientRect=function(){return {top:60,left:8,width:374,height:500,bottom:560,right:382}};
 Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return 374}});
 Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 500}});
 Object.defineProperty(w.HTMLElement.prototype,'scrollWidth',{get(){return this.classList.contains('fsj-page-flow')?3*398-24:374}});
 const raf=w.requestAnimationFrame.bind(w);w.requestAnimationFrame=fn=>{frames++;return raf(fn)};
 w.eval(script);return {dom,w,desktop(){mobile=false;w.dispatchEvent(new w.Event('resize'))},frames:()=>frames,wait:()=>new Promise(r=>setTimeout(r,70))};
}
test('mobile pages preserve inputs, selected files, links and event handlers; buttons reach every page',async()=>{
 const f=fixture('<main><h1>Tarefa</h1><input id="text"><input id="files" type="file"><a href="#task">Abrir tarefa</a><button id="save">Salvar</button></main>');const {w}=f;await f.wait();const input=w.document.getElementById('text'),files=w.document.getElementById('files');input.value='Resposta ainda não enviada';const selected={length:1,0:{name:'foto.jpg'}};Object.defineProperty(files,'files',{value:selected});let saved=0;w.document.getElementById('save').onclick=()=>saved++;
 const [prev,next]=w.document.querySelectorAll('.fsj-page-navigation button'),viewport=w.document.querySelector('.fsj-page-viewport');assert(prev.disabled);assert(!next.disabled);next.click();assert.equal(viewport.scrollLeft,398);next.click();assert(next.disabled);prev.click();assert.equal(viewport.scrollLeft,398);assert.equal(input.value,'Resposta ainda não enviada');assert.equal(files.files,selected);w.document.getElementById('save').click();assert.equal(saved,1);assert.equal(w.document.querySelector('a').getAttribute('href'),'#task');
 const frames=f.frames();await f.wait();assert.equal(f.frames(),frames,'pager must settle without observer feedback');f.desktop();await f.wait();assert(!w.document.documentElement.classList.contains('fsj-mobile'));assert.equal(w.document.querySelector('main').style.height,'');f.dom.window.close();
});
test('manager keeps navigation hooks and pages only the active tab',async()=>{
 const f=fixture('<main><div id="gestor"><div id="novaTarefa" class="card"><textarea id="draft"></textarea></div><div id="demandas" class="card hidden"><h2>Demandas</h2></div><div id="dashboard" class="grid"><div class="kpi">1</div></div></div></main>');await f.wait();const {w}=f;assert.equal(typeof w.fsjPersonLayout,'function');assert.equal(w.document.querySelectorAll('#gestor>div').length,3);assert(w.document.querySelector('#dashboard .fsj-page-flow').classList.contains('grid'));const area=w.document.getElementById('draft');area.value='Tarefa pendente';w.fsjPersonLayout(true);await f.wait();assert.equal(area.value,'Tarefa pendente');const frames=f.frames();await f.wait();assert.equal(f.frames(),frames);f.dom.window.close();
});
test('all mobile entry pages load the shared pager within their CSP',()=>{
 for(const name of ['index.html','quadro.html','responder.html','supervisor.html']){const html=fs.readFileSync(name,'utf8');assert.match(html,/mobile-pages\.js\?v=/);assert.match(html,/mobile-pages\.css\?v=/);const csp=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)/)?.[1];if(csp){assert.match(csp,/script-src 'self'/);assert.match(csp,/style-src 'self'/);}}
 const css=fs.readFileSync('mobile-pages.css','utf8');assert.match(css,/column-fill:auto/);assert.match(css,/height:52px/);assert.match(css,/object-fit:contain/);
});
test('first page can return to the previous app screen even when there is only one content page',async()=>{
 const f=fixture('<main><div id="gestor"><div id="demandas" class="card"><h2>Tarefas por funcionário</h2></div></div></main>');let backs=0;f.w.fsjCanGoBack=()=>true;f.w.fsjGoBack=()=>backs++;const flow=f.w.document.querySelector('.fsj-page-flow');Object.defineProperty(flow,'scrollWidth',{get(){return 374}});await f.wait();const footer=f.w.document.querySelector('.fsj-page-navigation'),[prev,next]=footer.querySelectorAll('button');assert.equal(footer.hidden,false);assert.equal(prev.disabled,false);assert.equal(next.disabled,true);prev.click();assert.equal(backs,1);f.dom.window.close();
});

test('resposta fica entre setas na ultima pagina e se recolhe na justificativa',async()=>{
 const f=fixture('<main><div id="taskScreen">Tarefa</div><div id="taskAnswer" hidden><button>SIM</button><button>NÃO</button><strong>CONCLUÍDA?</strong></div></main>',false,'https://test.invalid/responder.html');let details=true;f.w.fsjTaskAnswerVisible=()=>details;f.w.fsjCanGoBack=()=>true;await f.wait();const d=f.w.document,nav=d.querySelector('.fsj-page-navigation'),buttons=nav.querySelectorAll(':scope>button');assert.equal(buttons[0].textContent,'←');assert.equal(buttons[1].textContent,'→');assert.equal(buttons[0].getAttribute('aria-label'),'Anterior');assert(d.getElementById('taskAnswer').hidden);buttons[1].click();buttons[1].click();assert.equal(d.getElementById('taskAnswer').hidden,false);details=false;f.w.dispatchEvent(new f.w.Event('resize'));await f.wait();assert(d.getElementById('taskAnswer').hidden);f.dom.window.close();
});
