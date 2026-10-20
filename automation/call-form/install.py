from pathlib import Path
import sys, datetime, shutil, os

MARK = 'FSJ_SINGLE_CALL_FORM_V1'
JS = r'''
/* FSJ_SINGLE_CALL_FORM_V1 */
function fsjPrepareCallForm(){
 const panel=document.getElementById('callPanel'),live=document.getElementById('callLive');
 let prep=document.getElementById('fsjCallPreparation');
 if(!prep){
  prep=document.createElement('div');prep.id='fsjCallPreparation';
  for(const child of [...panel.children])if(!['callLive','recordSave','callCanvas'].includes(child.id))prep.append(child);
  panel.prepend(prep);
  const form=document.getElementById('callCreate'),box=document.getElementById('callParticipants');
  const field=box.closest('fieldset'),title=document.getElementById('callNewTitle').closest('label');
  const listLabel=document.createElement('label');listLabel.textContent='Participantes';listLabel.id='fsjParticipantLabel';
  const select=document.createElement('select');select.id='fsjParticipantList';listLabel.append(select);
  title.after(listLabel);
  const legend=field.querySelector('legend');if(legend)legend.remove();
  const hint=document.createElement('p');hint.id='fsjParticipantHint';hint.textContent='Convidar até 3 participantes';
  field.before(hint);
  select.onchange=()=>{const input=[...box.querySelectorAll('input')].find(x=>x.value===select.value);if(input){input.checked=!input.checked;input.dispatchEvent(new Event('change',{bubbles:true}));}sync();};
  function sync(){const inputs=[...box.querySelectorAll('input[type=checkbox]')];const options=[new Option('Selecione para marcar ou desmarcar…',''),...inputs.map(x=>new Option((x.checked?'✓ ':'')+x.parentElement.textContent.trim(),x.value))];select.replaceChildren(...options);}
  box.addEventListener('change',sync);new MutationObserver(sync).observe(box,{childList:true,subtree:true});sync();
 }
 prep.querySelectorAll('.page-flow,.step-hidden').forEach(x=>x.classList.remove('page-flow','step-hidden'));
 prep.hidden=!live.hidden;
 return prep;
}
'''
CSS = r'''
/* FSJ_SINGLE_CALL_FORM_V1 */
#fsjCallPreparation{width:100%;min-width:0}
#fsjCallPreparation[hidden]{display:none!important}
#fsjCallPreparation #callCreate{display:grid!important;grid-template-columns:1fr 1fr;gap:10px 16px}
#fsjCallPreparation #callCreate[hidden]{display:none!important}
#fsjCallPreparation #callCreate>label:first-child{grid-column:1/-1}
#fsjCallPreparation #callInviteActions,#fsjCallPreparation #callSaveDraft{grid-column:1/-1}
#fsjCallPreparation #callInviteActions{display:flex!important;flex-direction:column;gap:10px}
#fsjCallPreparation #fsjParticipantHint{margin:0;font-size:14px;position:static}
#fsjCallPreparation fieldset{margin:0;padding:8px 12px;min-width:0;background:#fff}
#fsjCallPreparation #callParticipants{display:flex!important;flex-wrap:wrap;gap:6px 18px}
#fsjCallPreparation #callParticipants label{display:flex!important;align-items:center;gap:8px;margin:0;min-height:36px}
#fsjCallPreparation #callParticipants input{width:20px;height:20px;flex:none}
#fsjCallPreparation #callStart{width:100%;margin:0}
#fsjCallPreparation>h1{margin:0 0 8px}
#fsjCallPreparation>p:not(#callStatus){font-size:12px;margin:6px 0}
#fsjCallPreparation #callSaveDraft{display:none!important}
#fsjCallPreparation #callRefresh{margin:10px 0;padding:7px 12px;font-size:13px}
@media(max-width:480px){#fsjCallPreparation #callCreate{grid-template-columns:1fr}}
'''

def prepare(app,css):
 if MARK in app:
  raise SystemExit('Formulário já instalado. Atualize o navegador com Ctrl+F5.')
 anchor='function units(el){'
 compact="compactChecks('callParticipants','Selecionar convidados · até três');"
 if app.count(anchor)!=1 or app.count(compact)!=1:
  raise SystemExit('Interface diferente da esperada. Nada alterado.')
 app=app.replace(compact,'',1)
 app=app.replace(anchor,anchor+"if(el.id==='callPanel'){const prep=fsjPrepareCallForm();if($('callLive').hidden)return [prep,...(!$('recordSave').hidden?units($('recordSave')):[])];}",1)
 return app+'\n'+JS,css+'\n'+CSS

def main():
 root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001')
 files=[root/'static/app.js',root/'static/style.css']
 original=[p.read_text(encoding='utf-8') for p in files]
 updated=prepare(*original)
 backup=root/'backups'/('formulario-chamada-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
 backup.mkdir(parents=True)
 for p in files:shutil.copy2(p,backup/p.name)
 try:
  for p,text in zip(files,updated):
   temp=p.with_name(p.name+'.formulario.tmp');temp.write_text(text,encoding='utf-8');shutil.copymode(p,temp);os.replace(temp,p)
 except Exception:
  for p in files:shutil.copy2(backup/p.name,p)
  raise
 print('INSTALADO: preparação da chamada em tela única; lista de participantes abaixo do título; rótulo fora da faixa branca.')
 print('Backup:',backup)
 print('Atualize o principal com Ctrl+F5 e reabra Vídeos e Chamadas. Não precisa reiniciar a VM nem reinstalar o Android.')
 print('Este ajuste altera apenas o formulário. O teste de toque, áudio e vídeo continua pendente.')
if __name__=='__main__':main()
