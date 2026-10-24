const {saveRecording,slotFor,MAX_BYTES}=require('../maria-diagnostic.js'),assert=require('node:assert/strict'),fs=require('node:fs');
class Database{
 constructor(){this.maps={clips:new Map(),meta:new Map()};this.fail=false;this.txCount=0}
 transaction(stores,mode){
  assert.deepEqual(stores,['clips','meta']);assert.equal(mode,'readwrite');this.txCount++;
  const db=this,staged={clips:new Map(this.maps.clips),meta:new Map(this.maps.meta)};
  const tx={pending:0,done:false,failed:false};
  tx.abort=()=>{if(tx.done||tx.failed)return;tx.failed=true;queueMicrotask(()=>tx.onabort?.())};
  function task(callback){tx.pending++;queueMicrotask(()=>{if(!tx.failed)callback();tx.pending--;queueMicrotask(()=>{if(!tx.pending&&!tx.done&&!tx.failed){tx.done=true;db.maps=staged;tx.oncomplete?.()}})})}
  tx.objectStore=name=>({get:key=>{const request={};task(()=>{request.result=staged[name].get(key);request.onsuccess?.()});return request},put:value=>{task(()=>{if(db.fail&&name==='clips'){tx.abort();return;}staged[name].set(name==='clips'?value.slot:value.key,value)});}});
  return tx;
 }
}
async function main(){
 const db=new Database();const blob=n=>({size:n,type:'video/webm',content:'clip-'+n});
 for(let i=1;i<=5;i++){const clip=await saveRecording(db,blob(i),'date-'+i);assert.equal(clip.slot,i)}
 assert.equal(db.maps.clips.size,5);assert.equal(db.maps.clips.get(1).sequence,1);
 const six=await saveRecording(db,blob(6),'date-6');assert.equal(six.slot,1);assert.equal(db.maps.clips.get(1).sequence,6);assert.equal(db.maps.clips.get(2).sequence,2);assert.equal(db.maps.clips.size,5);
 const seven=await saveRecording(db,blob(7),'date-7');assert.equal(seven.slot,2);assert.equal(db.maps.clips.get(2).sequence,7);assert.equal(db.maps.clips.get(1).sequence,6);
 const before=JSON.stringify([...db.maps.clips]),sequence=db.maps.meta.get('sequence').value;
 db.fail=true;await assert.rejects(()=>saveRecording(db,blob(8)),/preservados/);assert.equal(JSON.stringify([...db.maps.clips]),before);assert.equal(db.maps.meta.get('sequence').value,sequence);
 db.fail=false;await assert.rejects(()=>saveRecording(db,{size:MAX_BYTES+1}),/limite/);await assert.rejects(()=>saveRecording(db,{size:0}),/vazio/);assert.equal(JSON.stringify([...db.maps.clips]),before);
 for(let i=8;i<=30;i++)await saveRecording(db,blob(i));assert.equal(db.maps.clips.size,5);assert.deepEqual([...db.maps.clips.keys()].sort(),[1,2,3,4,5]);assert.equal(slotFor(31),1);
 const code=fs.readFileSync('maria-diagnostic.js','utf8'),html=fs.readFileSync('index.html','utf8');assert(!/\bfetch\s*\(|WebSocket|XMLHttpRequest/.test(code));assert(html.includes('if(window.mariaDiagnosticBusy)return false;'));assert(code.includes('failed=true;finish()'));
 console.log('PASS: rotação 1–5, sexto substitui primeiro, sétimo substitui segundo, falha preserva anteriores e limite de tamanho antes da escrita.');
}main().catch(error=>{console.error(error);process.exit(1)});
