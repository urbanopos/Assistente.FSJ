export function accessURL(value,page,sentAt){
 const u=new URL(value);
 const token=new URLSearchParams(u.hash.slice(1)).get('token');
 if(u.origin!=='https://urbanopos.github.io'||u.pathname!=='/Assistente.FSJ/'+page||u.username||u.password||!token)throw Error('Destino fora do Assistente FSJ.');
 u.searchParams.set('fsj_web','20261019-legenda-direta');
 if(sentAt)u.searchParams.set('envio',sentAt);
 return u.href;
}
export function accessCaption({day,name,boardUrl,supervisionUrl,warning=''}){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day))throw Error('Data invalida.');
 const own=accessURL(boardUrl,'quadro.html'),other=supervisionUrl?accessURL(supervisionUrl,'supervisor.html'):null;
 const person=String(name||'').replace(/[\r\n*_~`]/g,' ').trim().slice(0,80);
 const text=['*Fazenda S\u00e3o Jos\u00e9*','*GEST\u00c3O DE TAREFAS '+day.split('-').reverse().join('/')+'*','','Bom dia, '+person+'!','Acesse diretamente pelos links abaixo:','','*CONSULTAR TAREFAS*',own,...(other?['','*TAREFAS DE TERCEIROS*',other]:[]),'',...(warning?['Aviso: apagamento anterior sem confirma\u00e7\u00e3o.']:[]),'*ESTA MENSAGEM CANCELA AS ANTERIORES*'].join('\n');
 if(text.length>1024)throw Error('Legenda excede o limite previsto; nada enviado.');
 return text;
}
