function fsjTaskListLabel(code,text,frequency){
 const raw=String(text||'').replace(/^Tar\s*-\s*\d+(?:\s+(?:SM|P|D|S|M|T|A))?\s*[-—:–]?\s*/i,'').trim();
 const words=raw.split(/\s+/).filter(Boolean),excerpt=words.slice(0,3).join(' ');
 return fsjTaskNumber(code,frequency)+(excerpt?' — '+excerpt+(words.length>3?'…':''):'');
}
function fsjTaskNumber(code,frequency){
 if(!code)return 'Tarefa sem número';
 const raw=String(code).trim();
 const digits=raw.match(/^Tar\s*-\s*(\d+)$/i);
 const number=digits?'Tar - '+digits[1].padStart(7,'0'):raw.replace(/^Tar\s*-\s*/i,'Tar - ');
 const suffix={pontual:'P',diaria:'D',semanal:'S',mensal:'M',trimestral:'T',semestral:'SM',anual:'A'}[String(frequency||'').toLowerCase()];
 return suffix?number+' '+suffix:number;
}
let fsjTaskDetailRequest=0;
async function fsjOpenTaskDetails(code,description,context='',loadDetails,frequency){
 const request=++fsjTaskDetailRequest;
 let dialog=document.getElementById('fsj-task-detail');
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='fsj-task-detail';dialog.setAttribute('aria-labelledby','fsj-task-detail-title');
  const header=document.createElement('header'),logo=document.createElement('img');logo.src='./icon-512.png';logo.alt='';logo.width=48;logo.height=48;
  const close=document.createElement('button');close.type='button';close.className='fsj-dialog-close';close.textContent='×';close.setAttribute('aria-label','Fechar detalhes da tarefa');close.title='Fechar';close.addEventListener('click',()=>dialog.close());
  header.append(logo,document.createTextNode('Fazenda São José'),close);
  const content=document.createElement('section'),title=document.createElement('h2'),meta=document.createElement('p'),text=document.createElement('p'),footer=document.createElement('footer'),back=document.createElement('button');
  title.id='fsj-task-detail-title';meta.id='fsj-task-detail-meta';text.id='fsj-task-detail-description';back.type='button';back.className='fsj-nav-arrow';back.textContent='←';back.setAttribute('aria-label','Voltar à lista de tarefas');back.addEventListener('click',()=>dialog.close());
  const history=document.createElement('div');history.id='fsj-task-detail-history';content.append(title,meta,text,history);footer.append(back);dialog.append(header,content,footer);document.body.append(dialog);
 }
 document.getElementById('fsj-task-detail-title').textContent=fsjTaskNumber(code,frequency);
 document.getElementById('fsj-task-detail-meta').textContent=context;
 document.getElementById('fsj-task-detail-description').textContent=description||'Sem descrição registrada.';
 const history=document.getElementById('fsj-task-detail-history');history.replaceChildren();
 if(!dialog.open)dialog.showModal();
 if(!loadDetails)return;
 history.textContent='Consultando registros da tarefa…';
 try{
  const details=await loadDetails();if(request!==fsjTaskDetailRequest||!dialog.open)return;
  if(details.description!==undefined)document.getElementById('fsj-task-detail-description').textContent=details.description;
  history.replaceChildren();
  for(const section of details.sections){const heading=document.createElement('h3');heading.textContent=section.title;history.append(heading);for(const entry of section.entries){const block=document.createElement('div');block.className='fsj-detail-entry';const text=document.createElement('p');text.textContent=entry.text;block.append(text);for(const action of entry.actions||[]){const button=document.createElement('button');button.type='button';button.textContent=action.label;button.addEventListener('click',async()=>{button.disabled=true;try{await action.run();}catch{const error=document.createElement('p');error.textContent='Não foi possível abrir o registro. Tente novamente.';block.append(error);}finally{button.disabled=false;}});block.append(button);}history.append(block);}}
 }catch{
  if(request!==fsjTaskDetailRequest||!dialog.open)return;history.textContent='Não foi possível consultar os registros. Nenhuma informação de execução pode ser confirmada agora.';const retry=document.createElement('button');retry.type='button';retry.textContent='Tentar novamente';retry.onclick=()=>fsjOpenTaskDetails(code,description,context,loadDetails);history.append(retry);
 }
}
const fsjTaskListStyle=document.createElement('style');
fsjTaskListStyle.textContent=`.fsj-task-number{display:inline-block;width:auto;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:4px 8px;min-height:30px;margin:0;background:transparent;border:1px solid #bed5c2;border-radius:7px;font:inherit;font-weight:700;cursor:pointer;color:inherit;text-decoration:underline;text-underline-offset:3px}#fsj-task-detail{box-sizing:border-box;width:min(760px,100vw);max-width:100vw;max-height:100dvh;padding:0;border:0;border-radius:12px;background:#f4f6ed;color:#213d2d;font:17px system-ui,Arial}#fsj-task-detail::backdrop{background:#102e24a8}#fsj-task-detail header{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#174b3b;color:white;font-weight:700}#fsj-task-detail header{position:sticky;top:0;z-index:1}#fsj-task-detail .fsj-dialog-close{margin-left:auto;flex:none;display:grid;place-items:center;width:44px;height:44px;padding:0;border:1px solid #ffffff70;border-radius:8px;background:transparent;color:#fff;font:32px/1 Arial;cursor:pointer}#fsj-task-detail .fsj-dialog-close:focus-visible{outline:3px solid #fff;outline-offset:2px}#fsj-task-detail section{padding:14px 20px}#fsj-task-detail h2{margin:0 0 10px;color:#213d2d}#fsj-task-detail-description{font-weight:800;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.55;color:#000}#fsj-task-detail-meta{font-size:14px}#fsj-task-detail-history h3{font-size:18px;margin:20px 0 8px}#fsj-task-detail-history p{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0;line-height:1.5}#fsj-task-detail-history .fsj-detail-entry{padding:8px 0;border-bottom:1px solid #bed5c2}#fsj-task-detail-history button{font:inherit;cursor:pointer;padding:6px 10px;margin:4px 6px 4px 0;border:1px solid #bed5c2;border-radius:7px;background:#eaf4e9;color:#213d2d}#fsj-task-detail footer{padding:8px 16px}#fsj-task-detail .fsj-nav-arrow{font-size:30px;font-weight:800;line-height:1;padding:4px 12px;background:#235d41;color:white;border:0;border-radius:8px;cursor:pointer}@media(max-width:700px){#fsj-task-detail{width:100vw;height:100dvh;max-height:100dvh;margin:0;border-radius:0;overflow:auto}}`;
document.head.append(fsjTaskListStyle);
