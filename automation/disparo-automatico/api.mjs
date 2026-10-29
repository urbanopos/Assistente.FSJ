// API FSJ — ponte de programação para agente Android.
// Sem API oficial de envio do WhatsApp pessoal. Nunca afirma entrega sem confirmação.
import http from 'node:http';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';

const token=process.env.FSJ_DISPARO_API_TOKEN;
const file=resolve(process.env.FSJ_DISPARO_STATE_FILE||'./fsj-disparo-state.json');
const host=process.env.FSJ_DISPARO_HOST||'127.0.0.1';
const port=Number(process.env.FSJ_DISPARO_PORT||18790);
if(!token||token.length<32)throw Error('FSJ_DISPARO_API_TOKEN deve ter pelo menos 32 caracteres aleatórios.');
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Porta inválida.');
let state={jobs:[]};try{state=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
if(!Array.isArray(state.jobs))throw Error('Estado inválido.');
const save=async()=>{await mkdir(dirname(file),{recursive:true});const tmp=file+'.tmp';await writeFile(tmp,JSON.stringify(state,null,2),{mode:0o600});await rename(tmp,file);};
const respond=(res,code,obj)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));};
const secure=(v)=>{const a=Buffer.from(v||'');const b=Buffer.from(token);return a.length===b.length&&timingSafeEqual(a,b);};
const readBody=async req=>{let data='';for await(const part of req){data+=part;if(data.length>65536)throw Error('Corpo muito grande.');}return JSON.parse(data||'{}');};
const validId=s=>typeof s==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(s);
const validTime=s=>typeof s==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s);
const dateRecife=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Recife',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const nowRecife=()=>new Intl.DateTimeFormat('en-GB',{timeZone:'America/Recife',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
const server=http.createServer(async(req,res)=>{
 try{
  if(!secure((req.headers.authorization||'').replace(/^Bearer /i,'')))return respond(res,401,{error:'Não autorizado'});
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/health')return respond(res,200,{ok:true,service:'fsj-disparo-automatico-api'});
  if(req.method==='POST'&&url.pathname==='/v1/programacoes'){
   const x=await readBody(req);
   if(!Array.isArray(x.destinatarios)||x.destinatarios.length<1||x.destinatarios.length>500||x.destinatarios.some(p=>!validId(p.pessoa_id)||typeof p.mensagem!=='string'||!p.mensagem.trim()||p.mensagem.length>4000))return respond(res,400,{error:'Destinatários inválidos'});
   if(!validTime(x.horario)||typeof x.dia!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x.dia))return respond(res,400,{error:'Data ou horário inválidos'});
   if(!validId(x.programacao_id)||new Set(x.destinatarios.map(p=>p.pessoa_id)).size!==x.destinatarios.length)return respond(res,400,{error:'Programação ou destinatários duplicados'});
   const existing=state.jobs.filter(j=>j.programacao_id===x.programacao_id);
   if(existing.length)return respond(res,200,{programacao_id:x.programacao_id,quantidade:existing.length,reutilizada:true});
   for(const p of x.destinatarios)state.jobs.push({id:randomUUID(),programacao_id:x.programacao_id,pessoa_id:p.pessoa_id,mensagem:p.mensagem,dia:x.dia,horario:x.horario,estado:'pendente',criado_em:new Date().toISOString()});
   await save();return respond(res,201,{programacao_id:x.programacao_id,quantidade:x.destinatarios.length,estado:'programado'});
  }
  if(req.method==='GET'&&url.pathname==='/v1/android/pendentes'){
   const today=dateRecife(),time=nowRecife();
   const jobs=state.jobs.filter(j=>j.estado==='pendente'&&(j.dia<today||(j.dia===today&&j.horario<=time))).slice(0,30);
   return respond(res,200,{jobs,observacao:'Pendente não significa enviado pelo WhatsApp'});
  }
  const match=url.pathname.match(/^\/v1\/android\/jobs\/([0-9a-f-]{36})\/resultado$/);
  if(req.method==='POST'&&match){
   const x=await readBody(req);const j=state.jobs.find(j=>j.id===match[1]);
   if(!j)return respond(res,404,{error:'Job inexistente'});
   if(!['preparado','confirmado_pelo_operador','falhou','incerto'].includes(x.estado))return respond(res,400,{error:'Estado inválido'});
   if(j.estado!=='pendente'&&j.estado!=='preparado'&&j.estado!=='incerto')return respond(res,409,{error:'Estado final já registrado'});
   j.estado=x.estado;j.resultado_em=new Date().toISOString();j.detalhe=String(x.detalhe||'').slice(0,500);await save();
   return respond(res,200,{id:j.id,estado:j.estado});
  }
  return respond(res,404,{error:'Rota inexistente'});
 }catch(e){return respond(res,400,{error:String(e.message).slice(0,250)});}
});
server.listen(port,host,()=>console.log('FSJ API ativa em '+host+':'+port));
