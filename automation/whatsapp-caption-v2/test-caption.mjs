import assert from 'node:assert/strict';
import {mkdtemp,writeFile,copyFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {accessURL,accessCaption} from './fsj-access-caption.mjs';
const own='https://urbanopos.github.io/Assistente.FSJ/quadro.html#token=00000000-0000-4000-8000-000000000001';
const other='https://urbanopos.github.io/Assistente.FSJ/supervisor.html#token=00000000-0000-4000-8000-000000000002';
for(const supervisionUrl of [undefined,other]){
 const text=accessCaption({day:'2026-10-19',name:'Teste',boardUrl:own,supervisionUrl});assert(text.includes('*CONSULTAR TAREFAS*'));assert.equal(text.includes('*TAREFAS DE TERCEIROS*'),!!supervisionUrl);assert(text.length<=1024);
 for(const line of text.split('\n').filter(x=>x.startsWith('https:'))){const u=new URL(line);assert.equal(u.searchParams.get('fsj_web'),'20261019-legenda-direta');assert(new URLSearchParams(u.hash.slice(1)).has('token'));assert(!u.pathname.endsWith('.pdf'));}
}
assert.throws(()=>accessURL('https://evil.test/quadro.html#token=x','quadro.html'));
assert.throws(()=>accessURL('https://urbanopos.github.io/Assistente.FSJ/quadro.html','quadro.html'));
const dir=await mkdtemp(join(tmpdir(),'fsj-caption-'));
try{
 for(const f of ['card-bundle.mjs','fsj-access-caption.mjs'])await copyFile(new URL(f,import.meta.url),join(dir,f));
 await writeFile(join(dir,'compact-card-pdf.mjs'),'export const compactDailyPdf=()=>Buffer.from("%PDF-test");');
 await writeFile(join(dir,'fsj-card-mode.json'),JSON.stringify({enabled:true,daily:true,days:[]}));
 const {cardEnabled,prepareCard,transmitCard}=await import(pathToFileURL(join(dir,'card-bundle.mjs')));
 assert(cardEnabled('2026-10-20'));assert(cardEnabled('2027-01-01'));
 const prepared=await prepareCard({day:'2026-10-19',name:'Teste',boardUrl:own,supervisionUrl:other,now:new Date('2026-10-19T11:00:00Z')});
 let sent=0,persisted=0,guards=0;
 const result=await transmitCard({client:{sendMessage:async(chat,media,opt)=>{sent++;assert.equal(media.mime,'application/pdf');assert.equal(opt.caption,prepared.caption);return{id:{_serialized:'test-id'}};}},chatId:'test-chat',prepared,MessageMedia:class{constructor(mime){this.mime=mime}},beforeTransmit:async()=>{guards++},onPart:async r=>{persisted++;assert.equal(r.messageId,'test-id')}});
 assert.equal(sent,1);assert.equal(guards,1);assert.equal(persisted,1);assert.deepEqual(result.messageIds,['test-id']);
 await writeFile(join(dir,'fsj-card-mode.json'),JSON.stringify({enabled:false,daily:true}));assert.equal(cardEnabled('2026-10-20'),false);
 console.log('PASS: links web individuais, supervisor condicional, um PDF, legenda, recibo e modo diario permanente.');
}finally{await rm(dir,{recursive:true,force:true})}
