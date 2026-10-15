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
 return {call:()=>handler(new Request('https://test.invalid',{method:'POST',headers:{origin:'https://urbanopos.github.io',authorization:'Bearer user','content-type':'application/json'},body:JSON.stringify({pessoa_id:'test-person'})})),creates:()=>creates};}
test('reutiliza quadro; prepara telefone e link sem presumir envio',async()=>{const s=setup(),r=await s.call(),d=await r.json();assert.equal(r.status,200);assert.equal(d.phone,'5581999999999');assert.match(d.text,/quadro.html#token=test-token/);assert.equal(s.creates(),0);});
test('cria quadro ausente e recupera token persistido',async()=>{const s=setup({existing:false});assert.equal((await s.call()).status,200);assert.equal(s.creates(),1);});
test('outro usuário não acessa quadro',async()=>{const s=setup({email:'other@example.com'});assert.equal((await s.call()).status,403);assert.equal(s.creates(),0);});
test('bloqueio de calendário impede geração',async()=>{const s=setup({allowed:false});assert.equal((await s.call()).status,409);assert.equal(s.creates(),0);});
