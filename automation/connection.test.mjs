import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {EventEmitter} from 'node:events';
const source=(await readFile(new URL('./wa.mjs',import.meta.url),'utf8')).split('export async function revoke')[0].replace(/^import .*;\n/gm,'').replace('export async function connect','async function connect');
function setup(initialize){let client,cleared=0;class Client extends EventEmitter{constructor(){super();client=this;this.destroyed=false;}initialize(){return initialize(this);}async destroy(){this.destroyed=true;}}
 const ctx=vm.createContext({wwebjs:{Client,LocalAuth:class{}},process:{env:{FSJ_STATE_DIR:'/test'}},mkdir:async()=>{},resolve:(...xs)=>xs.join('/'),console,setTimeout:(fn)=>setTimeout(fn,10),clearTimeout:id=>{cleared++;clearTimeout(id);}});
 vm.runInContext(source,ctx);return {connect:ctx.connect,client:()=>client,cleared:()=>cleared};}
test('timeout enquanto initialize está pendente retorna erro tratado e fecha cliente',async()=>{const s=setup(()=>new Promise(()=>{}));await assert.rejects(s.connect(),/90 segundos/);assert.equal(s.client().destroyed,true);assert.ok(s.cleared()>0);});
test('falha de inicialização limpa timer; ready encerra com sucesso',async()=>{const f=setup(async()=>{throw Error('browser failed')});await assert.rejects(f.connect(),/browser failed/);assert.equal(f.client().destroyed,true);const s=setup(async c=>c.emit('ready'));assert.equal(await s.connect(),s.client());assert.equal(s.client().destroyed,false);});
test('QR fora do modo interativo rejeita sem travar inicialização',async()=>{const s=setup(c=>{c.emit('qr');return new Promise(()=>{});});await assert.rejects(s.connect(),/ainda não vinculado/);assert.equal(s.client().destroyed,true);});
