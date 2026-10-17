const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const marker='// FSJ_DAILY_LAYOUT_20261018';
const oldCaption=String.raw`const caption=('Fazenda Sao Jose\nEnvio: '+stamp+' (Recife)\n'+text.replace(match[0],url.href));`;
const caption=String.raw`// FSJ_DAILY_LAYOUT_20261018
  const caption=localDay(now)>='2026-10-18' ? [
    'Bom dia, '+String(board.responsavel||'').replace(/[\r\n*_~`+'`'+String.raw`]/g,' ').trim()+'!',
    'Envio: '+stamp+' (Recife)', '',
    '*CONSULTA TAREFAS*',url.href,'Consulte e atualize suas tarefas.',
    ...(text.match(/https:\/\/urbanopos\.github\.io\/Assistente\.FSJ\/supervisor\.html#[^\s]+/) ?
      ['', '*TAREFAS DE TERCEIROS*', text.match(/https:\/\/urbanopos\.github\.io\/Assistente\.FSJ\/supervisor\.html#[^\s]+/)[0], 'Acompanhe as tarefas dos seus supervisionados.'] : []),
    '', '*ESTA MENSAGEM CANCELA AS ANTERIORES*'
  ].join('\n') : ('Fazenda Sao Jose\nEnvio: '+stamp+' (Recife)\n'+text.replace(match[0],url.href));`;
const card='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><style>body{margin:0;font:22px Arial;color:#213d2d}#header{padding:20px;background:#efeae2}.card{background:#eaf4e9;border-radius:14px;overflow:hidden}.brand{padding:28px}h1{margin:0 0 14px;font-size:30px}.subtitle{font-size:19px;color:#64521d}.stripe{background:#dec078;padding:18px 28px;font-size:26px;font-weight:bold}</style><div id="header"><div class="card"><div class="brand"><h1>Fazenda São José</h1><div class="subtitle">GESTÃO DE TAREFAS __DATE__</div></div><div class="stripe">SUAS TAREFAS DO DIA</div></div></div></html>';
function patch(source){
 if(source.includes(marker))return source;
 if(!source.includes('FSJ_PRE_TRANSMISSION')||!source.includes('async function revokeLive'))throw Error('Versao local diferente da conferida. Nada alterado.');
 if(source.split(oldCaption).length!==2)throw Error('Legenda diferente da conferida. Nada alterado.');
 const lines=source.split('\n');const hits=lines.map((s,i)=>s.includes('await page.setContent(')?i:-1).filter(i=>i>=0);
 if(hits.length!==1)throw Error('Geracao da imagem diferente da conferida. Nada alterado.');
 const i=hits[0],line=lines[i];
 if(!line.includes('GESTÃO DE TAREFAS')||!line.trim().endsWith(');'))throw Error('Cartao diferente do conferido. Nada alterado.');
 const a=line.indexOf('await page.setContent(')+'await page.setContent('.length;
 const b=line.lastIndexOf(');');
 lines[i]=line.slice(0,a)+"localDay(now)>='2026-10-18' ? "+JSON.stringify(card)+".replace('__DATE__',localDay(now).split('-').reverse().join('/')) : ("+line.slice(a,b)+')'+line.slice(b);
 return lines.join('\n').replace(oldCaption,caption);
}
function install(root){
 const target=path.join(root,'wa.mjs');
 if(!fs.existsSync(target))throw Error('wa.mjs nao localizado.');
 const state=process.env.FSJ_STATE_DIR;
 if(state&&fs.existsSync(path.join(state,'routine.lock')))throw Error('Rotina em execucao; aguarde terminar. Nada alterado.');
 const old=fs.readFileSync(target,'utf8'),next=patch(old);
 if(old===next){console.log('Novo visual ja instalado. Nenhuma mensagem enviada.');return;}
 const suffix=Date.now()+'-'+crypto.randomUUID(),tmp=path.join(root,'daily-layout-check-'+suffix+'.mjs');
 try{
  fs.writeFileSync(tmp,next,{flag:'wx'});
  const checked=spawnSync(process.execPath,['--check',tmp],{encoding:'utf8'});
  if(checked.status!==0)throw Error('Validacao de sintaxe falhou. Nada alterado. '+checked.stderr);
  const backup=target+'.backup-layout-'+suffix;fs.copyFileSync(target,backup,fs.constants.COPYFILE_EXCL);
  if(fs.readFileSync(target,'utf8')!==old)throw Error('Arquivo alterado durante a instalacao. Tente novamente.');
  fs.renameSync(tmp,target);
  console.log('VISUAL INSTALADO: inicio em 18/10/2026, na rotina existente das 7h (Recife).');
  console.log('Backup: '+backup);
  console.log('Envio, apagamento, tentativas, horarios e diario preservados.');
  console.log('Nenhuma mensagem enviada e nenhum agendamento executado.');
 }finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp);}
}
module.exports={patch,install,oldCaption};if(require.main===module)install(process.argv[2]||__dirname);
