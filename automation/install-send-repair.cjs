const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function patchMedia(s){
 const start=s.indexOf('window.WWebJS.sendMessage =');if(start<0)throw Error('Funcao de envio nao localizada. Nada alterado.');
 const msg=s.indexOf('const message = {',start),end=s.indexOf('\n        };',msg);if(msg<0||end<0||!s.slice(msg,end).includes('id: newMsgKey'))throw Error('Objeto de envio diferente do esperado. Nada alterado.');
 const point=end+'\n        };'.length;if(s.slice(point,point+300).includes('delete message.__x_id;'))return s;
 return s.slice(0,point)+'\n        // FSJ: avoid MediaData private id overriding the outgoing MsgKey.\n        delete message.__x_id;'+s.slice(point);
}
function patchRunner(s){
 s=s.replace(/^\uFEFF/,'');if(s.includes('# FSJ_NATIVE_STDERR_FIX'))return s;
 const pattern=/^[ \t]*& \$NodePath \.\\run\.mjs \*>> \$log\r?\n[ \t]*exit \$LASTEXITCODE/m;
 if(!pattern.test(s))throw Error('Script do agendador diferente do esperado. Nada alterado.');
 return s.replace(pattern,[
 '    # FSJ_NATIVE_STDERR_FIX',
 '    $nativePreference = $ErrorActionPreference',
 '    try {',
 '        $ErrorActionPreference = "Continue"',
 '        & $NodePath .\\run.mjs *>> $log',
 '        $nodeExitCode = $LASTEXITCODE',
 '    } finally { $ErrorActionPreference = $nativePreference }',
 '    exit $nodeExitCode'
 ].join('\r\n'));
}
function install(automation=process.cwd(),state=process.env.FSJ_STATE_DIR){
 if(!state)throw Error('FSJ_STATE_DIR nao configurada.');
 if(fs.existsSync(path.join(state,'routine.lock')))throw Error('routine.lock presente. Conferir execucao antes de instalar; nenhum bloqueio foi removido.');
 const pkg=JSON.parse(fs.readFileSync(path.join(automation,'node_modules/whatsapp-web.js/package.json'),'utf8'));if(pkg.version!=='1.34.7')throw Error('Versao diferente de whatsapp-web.js 1.34.7. Nada alterado.');
 const media=path.join(automation,'node_modules/whatsapp-web.js/src/util/Injected/Utils.js'),runner=path.join(state,'fsj-7h.ps1');
 const plans=[[media,patchMedia],[runner,patchRunner]].map(([p,patch])=>{const old=fs.readFileSync(p,'utf8');return {p,old,next:patch(old)};});
 const suffix='.backup-fsj-'+Date.now()+'-'+crypto.randomUUID();
 for(const x of plans)if(x.old!==x.next)fs.copyFileSync(x.p,x.p+suffix);
 for(const x of plans)if(x.old!==x.next)fs.writeFileSync(x.p,x.next,'utf8');
 console.log('Correcao de imagem e execucao do agendador instaladas com backup.');
 console.log('Diario e bloqueios de envio incerto preservados. Nenhuma mensagem enviada.');
}
module.exports={patchMedia,patchRunner,install};if(require.main===module)install();
