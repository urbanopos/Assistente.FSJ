#!/usr/bin/env node
// FSJ Autonomo 2.0 - simulador isolado, SEM acesso ao WhatsApp.
import {mkdir,readFile,writeFile,rename,open} from 'node:fs/promises';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
const root=process.env.FSJ_V2_TEST_DIR;
if(!root) throw Error('Defina FSJ_V2_TEST_DIR para uma pasta exclusiva de testes.');
const command=process.argv[2]||'status';
const now=()=>new Date().toISOString();
const file=join(root,'journal.json');
await mkdir(root,{recursive:true,mode:0o700});
let data;
try{data=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;data={schema:1,mode:'SIMULACAO',history:[],previous:null};}
if(data.mode!=='SIMULACAO')throw Error('Modo inesperado: envio bloqueado');
if(command==='status'){console.log(JSON.stringify({mode:data.mode,total:data.history.length,previous:data.previous},null,2));process.exit(0);}
if(command!=='simular')throw Error('Uso: node dry-run.mjs status|simular');
const lock=join(root,'execution.lock');
let fd;
try{fd=await open(lock,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw Error('Execucao concorrente bloqueada; conferir antes de retirar lock.');throw e;}
try{
  const id=randomUUID(), previous=data.previous;
  const record={id,time:now(),recipient:'PROPRIETARIO_SIMULADO',content:'Acesse a TV FSJ: https://192.168.1.114',previousId:previous,deletePrevious:previous?'SIMULADO':'NAO_APLICAVEL',send:'SIMULADO_SEM_ENVIO',delivered:false};
  data.history.push(record);data.previous=id;
  const tmp=file+'.'+id+'.tmp';
  await writeFile(tmp,JSON.stringify(data,null,2)+'\n',{mode:0o600});
  await rename(tmp,file);
  console.log(JSON.stringify(record,null,2));
}finally{await fd.close();const {unlink}=await import('node:fs/promises');await unlink(lock);}
