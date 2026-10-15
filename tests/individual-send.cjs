process.chdir(require('node:path').resolve(__dirname,'..'));
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('supabase/functions/envio-manual/index.ts','utf8');
function setup({email='urbanopos@yahoo.com.br',allowed=true,existing=true}={}){let handler,creates=0;const fixed=new Date('2026-10-15T10:20:00Z');class Clock extends Date{constructor(...args){super(...(args.length?args:[fixed]));}};
 const context={Deno:{env:{get:n=>n==='SUPABASE_URL'?'https://test.invalid':'secret'},serve:f=>handler=f},Date:Clock,Intl,Response,AbortSignal,console,fetch:async(url,opt)=>{
 if(url.endsWith('/auth/v1/user'))return Response.json({email});
 if(url.includes('fsj_preparar_calendario'))return Response.json(null);
 if(url.includes('fsj_pode_enviar'))return Response.json(allowed);
 if(url.includes('/pessoas?'))return Response.json([{nome:'Pessoa teste',whatsapp:'81999999999'}]);
 if(url.includes('/quadros_do_dia?')){if(opt.method==='POST'){creates++;existing=true;return Response.json([]);}return Response.json(existing?[{token:'test-token',expira_em:'2026-10-16T03:00:00Z'}]:[]);}
 if(url.includes('mensagens_whatsapp?'))return Response.json([]);
 if(url.includes('fsj_link_supervisao'))return Response.json(null);
 throw Error('Unexpected '+url);
 }};vm.runInNewContext(source,context);
 return {call:()=>handler(new Request('https://test.invalid',{method:'POST',headers:{origin:'https://urbanopos.github.io',authorization:'Bearer user','content-type':'application/json'},body:JSON.stringify({action:'individual',pessoa_id:'test-person'})})),creates:()=>creates};}
test('reutiliza quadro; prepara telefone e link sem presumir envio',async()=>{const s=setup(),r=await s.call(),d=await r.json();assert.equal(r.status,200);assert.equal(d.phone,'5581999999999');assert.match(d.text,/quadro.html#token=test-token/);assert.equal(s.creates(),0);});
test('cria quadro ausente e recupera token persistido',async()=>{const s=setup({existing:false});assert.equal((await s.call()).status,200);assert.equal(s.creates(),1);});
test('outro usuário não acessa quadro',async()=>{const s=setup({email:'other@example.com'});assert.equal((await s.call()).status,403);assert.equal(s.creates(),0);});
test('bloqueio de calendário impede geração',async()=>{const s=setup({allowed:false});assert.equal((await s.call()).status,409);assert.equal(s.creates(),0);});
function ui(){
 const html=fs.readFileSync('index.html','utf8'),code=html.slice(html.indexOf('const fsjIndividualBusy=new Set();'),html.indexOf('function openWA(){'));
 function element(){return {children:[],style:{},dataset:{},append(...xs){this.children.push(...xs);},replaceChildren(){this.children=[];},setAttribute(k,v){this[k]=v;},addEventListener(k,v){this[k]=v;}};}
 const list=element(),people=[{id:'one',nick:'Pessoa A',active:true,whatsapp7h:true},{id:'two',nick:'Pessoa B',active:true,whatsapp7h:true}];let target='',calls=[];
 const c={S:{people},document:{createElement:element,getElementById:()=>list},window:{},fsjPainelPronto:true,location:{assign:url=>target=url},confirm:()=>true,api:async(path,opt)=>{const d=JSON.parse(opt.body);calls.push(d);return {phone:d.pessoa_id==='one'?'5581999999999':'5581888888888',text:'quadro#token='+d.pessoa_id,ja_registrado:false};}};
 vm.runInNewContext(code,c);return {c,list,people,target:()=>target,calls};
}
test('botão de cada pessoa abre somente seu telefone e token',async()=>{const u=ui();u.c.fsjRenderIndividualList();assert.equal(u.list.children.length,2);const button=u.list.children[1].children[1];await button.click();assert.equal(u.calls[0].pessoa_id,'two');assert.equal(u.calls[0].action,'individual');assert(u.target().startsWith('https://wa.me/5581888888888?text='));assert(decodeURIComponent(u.target()).endsWith('quadro#token=two'));assert.equal(u.list.children[1].children[3].hidden,false);});
test('cadastro sem recebimento tem botão desabilitado',()=>{const u=ui();u.people[0].whatsapp7h=false;u.c.fsjRenderIndividualList();assert.equal(u.list.children[0].children[1].disabled,true);});
