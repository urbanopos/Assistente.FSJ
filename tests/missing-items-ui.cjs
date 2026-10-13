const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
test('NÃO mostra campo e envia itens; SIM oculta e não envia conteúdo antigo',async()=>{
 const dom=new JSDOM(fs.readFileSync('responder.html','utf8'),{runScripts:'outside-only',url:'https://test.invalid/responder.html#token=00000000-0000-4000-8000-000000000031'}),w=dom.window;let body;
 w.fetch=async(url,opt)=>{if(typeof opt.body==='string')return {ok:true,json:async()=>({tarefa:'Teste',responsavel:'Pessoa',dia:'2026-10-13',respondido:false})};body=opt.body;return {ok:true,json:async()=>({ok:true,tarefa_proprietario_id:body.get('resposta')==='nao'?'nova':null,anexos_nao_salvos:[]})}};
 w.eval(dom.window.document.querySelector('script').textContent);await w.load();
 const nao=w.document.querySelector('[value=nao]'),sim=w.document.querySelector('[value=sim]');nao.checked=true;nao.dispatchEvent(new w.Event('change'));assert.equal(w.document.getElementById('missingBox').hidden,false);
 w.document.getElementById('why').value='Sem ferramenta';w.document.getElementById('missing').value='Enxada <script>';await w.document.getElementById('send').onclick();assert.equal(body.get('itens_faltantes'),'Enxada <script>');assert.match(w.document.querySelector('#done p').textContent,/Proprietário/);
 sim.checked=true;sim.dispatchEvent(new w.Event('change'));assert.equal(w.document.getElementById('missingBox').hidden,true);await w.document.getElementById('send').onclick();assert.equal(body.get('itens_faltantes'),'');dom.window.close();
});
