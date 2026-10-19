import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const original=await readFile(new URL('./fsj-emergencia-legenda.mjs',import.meta.url),'utf8');
globalThis.fsjCaption=await import('./fsj-access-caption.mjs');
for(const scenario of ['existing','new','uncertain','delete-failure']){
 const dir=await mkdtemp(join(tmpdir(),'fsj-test-'));
 process.env.FSJ_STATE_DIR=dir;process.env.SUPABASE_SERVICE_ROLE_KEY='TEST';
 let sends=0,revokes=0,records=0;
 await writeFile(join(dir,'substituicao-web-2026-10-19.json'),JSON.stringify({person:{phase:'done',result:{messageId:'v1-id'}}}));
 globalThis.fsjTest={connect:async()=>({getNumberId:async()=>({_serialized:'chat'}),sendMessage:async(_chat,media)=>{assert.equal(media.mime,'application/pdf');sends++;return {id:{_serialized:'new-id'}};},destroy:async()=>{}}),revoke:async()=>{revokes++;return {status:scenario==='delete-failure'?'falhou':'confirmado'};}};
 globalThis.fetch=async(url,opt={})=>{
  let value=null;const route=url.split('/rest/v1/')[1];
  if(url.includes('/functions/'))value={dia:'2026-10-19'};
  else if(route.startsWith('rpc/fsj_pode_enviar'))value=true;
  else if(route.startsWith('rpc/fsj_link_supervisao'))value=null;
  else if(route.startsWith('pessoas?'))value=[{id:'person',nome:'Teste',ativo:true,receber_tarefas_whatsapp:true,whatsapp:'81999999999'}];
  else if(route.startsWith('tarefas?')||route.startsWith('tarefa_responsaveis?')||route.startsWith('retornos?'))value=[];
  else if(route.startsWith('quadros_do_dia?'))value=[{token:'test-token'}];
  else if(route.startsWith('mensagens_whatsapp?')&&opt.method==='POST'){records++;value=null;}
  else if(route.startsWith('mensagens_whatsapp?'))value=scenario==='new'?[]:[{whatsapp_message_id:'old-id',criado_em:'2026-10-19T10:00:00Z',conteudo:JSON.stringify({messageIds:['old-id','old-header']})}];
  return {ok:true,text:async()=>value===null?'':JSON.stringify(value),json:async()=>value};
 };
 if(scenario==='uncertain')await writeFile(join(dir,'journal.json'),JSON.stringify({'person|2026-10-19':{phase:'sending'}}));
 let source=original.replace("import wwebjs from 'whatsapp-web.js';","const wwebjs={MessageMedia:class {constructor(mime){this.mime=mime}}};").replace("import {connect,revoke} from './wa.mjs';","const {connect,revoke}=globalThis.fsjTest;").replace("import {localDay,afterSeven,normalizePhone,isDayOff,eligible} from './core.mjs';","const localDay=()=> '2026-10-19',afterSeven=()=>true,normalizePhone=x=>x,isDayOff=()=>false,eligible=()=>[];").replace("import {compactDailyPdf} from './compact-card-pdf.mjs';","const compactDailyPdf=()=>Buffer.from('%PDF-test');").replace("import {accessURL,accessCaption} from './fsj-access-caption.mjs';","const {accessURL,accessCaption}=globalThis.fsjCaption;");
 try{
  await import('data:text/javascript;base64,'+Buffer.from(source+'\n//'+scenario).toString('base64'));
  if(['uncertain','delete-failure'].includes(scenario))assert.equal(sends,0);else{assert.equal(sends,1);assert.equal(records,1);assert.equal(revokes,scenario==='new'?0:2);await import('data:text/javascript;base64,'+Buffer.from(source+'\n//repeat'+scenario).toString('base64'));assert.equal(sends,1);}
 }finally{await rm(dir,{recursive:true,force:true});process.exitCode=0;}
}
console.log('PASS: PDF unico, novos integrantes, revogacao, bloqueio de incerteza e repeticao.');
