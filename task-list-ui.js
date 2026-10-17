function fsjTaskNumber(code){return code?String(code).replace(/^Tar\s*-\s*/i,'Tar - '):'Tarefa sem número';}
function fsjOpenTaskDetails(code,description,context=''){
 let dialog=document.getElementById('fsj-task-detail');
 if(!dialog){
  dialog=document.createElement('dialog');dialog.id='fsj-task-detail';dialog.setAttribute('aria-labelledby','fsj-task-detail-title');
  const header=document.createElement('header'),logo=document.createElement('img');logo.src='./icon-512.png';logo.alt='';logo.width=48;logo.height=48;
  header.append(logo,document.createTextNode('Fazenda São José'));
  const content=document.createElement('section'),title=document.createElement('h2'),meta=document.createElement('p'),text=document.createElement('p'),footer=document.createElement('footer'),back=document.createElement('button');
  title.id='fsj-task-detail-title';meta.id='fsj-task-detail-meta';text.id='fsj-task-detail-description';back.type='button';back.className='fsj-nav-arrow';back.textContent='←';back.setAttribute('aria-label','Voltar à lista de tarefas');back.addEventListener('click',()=>dialog.close());
  content.append(title,meta,text);footer.append(back);dialog.append(header,content,footer);document.body.append(dialog);
 }
 document.getElementById('fsj-task-detail-title').textContent=fsjTaskNumber(code);
 document.getElementById('fsj-task-detail-meta').textContent=context;
 document.getElementById('fsj-task-detail-description').textContent=description||'Sem descrição registrada.';
 if(!dialog.open)dialog.showModal();
}
const fsjTaskListStyle=document.createElement('style');
fsjTaskListStyle.textContent=`.fsj-task-number{display:inline-block;width:auto;white-space:nowrap;padding:4px 8px;min-height:30px;margin:0;background:transparent;border:1px solid #bed5c2;border-radius:7px;font:inherit;font-weight:700;cursor:pointer;color:inherit;text-decoration:underline;text-underline-offset:3px}#fsj-task-detail{box-sizing:border-box;width:min(760px,100vw);max-width:100vw;max-height:100dvh;padding:0;border:0;border-radius:12px;background:#f4f6ed;color:#213d2d;font:17px system-ui,Arial}#fsj-task-detail::backdrop{background:#102e24a8}#fsj-task-detail header{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#174b3b;color:white;font-weight:700}#fsj-task-detail section{padding:14px 20px}#fsj-task-detail h2{margin:0 0 10px;color:#213d2d}#fsj-task-detail-description{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.55;color:#213d2d}#fsj-task-detail-meta{font-size:14px}#fsj-task-detail footer{padding:8px 16px}#fsj-task-detail .fsj-nav-arrow{font-size:30px;font-weight:800;line-height:1;padding:4px 12px;background:#235d41;color:white;border:0;border-radius:8px;cursor:pointer}@media(max-width:700px){#fsj-task-detail{width:100vw;height:100dvh;max-height:100dvh;margin:0;border-radius:0;overflow:auto}}`;
document.head.append(fsjTaskListStyle);
