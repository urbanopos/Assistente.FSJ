from pathlib import Path
import sys,shutil,datetime,os
MARK='FSJ_CALL_SELECT_TOGGLE_V2'
OLD="""select.onchange=()=>{const input=[...box.querySelectorAll('input')].find(x=>x.value===select.value);if(input&&!input.disabled){input.checked=!input.checked;input.dispatchEvent(new Event('change',{bubbles:true}));}sync();};
  function sync(){const inputs=[...box.querySelectorAll('input[type=checkbox]')];const options=[new Option('Selecione para marcar ou desmarcar…',''),...inputs.map(x=>Object.assign(new Option((x.checked?'✓ ':'')+x.parentElement.textContent.trim(),x.value),{disabled:x.disabled}))];select.replaceChildren(...options);}"""
NEW="""/* FSJ_CALL_SELECT_TOGGLE_V2 */
  const selected=document.createElement('p');selected.id='fsjSelectedGuests';selected.setAttribute('aria-live','polite');selected.style.cssText='margin:6px 0;font-size:14px;overflow-wrap:anywhere';listLabel.after(selected);
  select.onchange=()=>{
   const input=[...box.querySelectorAll('input')].find(x=>x.value===select.value);
   if(input&&(!input.disabled||input.checked)){
    if(!input.checked&&box.querySelectorAll('input:checked').length>=3){selected.textContent='Selecione até 3 participantes. Desmarque um nome para trocar.';select.value='';return;}
    input.checked=!input.checked;input.dispatchEvent(new Event('change',{bubbles:true}));
   }
   sync();
  };
  function sync(){
   const inputs=[...box.querySelectorAll('input[type=checkbox]')];
   const options=[new Option('Selecione para marcar ou desmarcar…',''),...inputs.map(x=>Object.assign(new Option((x.checked?'✓ ':'')+x.parentElement.textContent.trim(),x.value),{disabled:x.disabled&&!x.checked}))];
   select.replaceChildren(...options);select.value='';
   const names=inputs.filter(x=>x.checked).map(x=>x.parentElement.textContent.trim());selected.textContent=names.length?'Selecionados: '+names.join(', '):'Nenhum participante selecionado.';
  }"""
CSS='''
/* FSJ_CALL_SELECT_TOGGLE_V2 */
#fsjCallPreparation #callParticipants,#fsjCallPreparation #callInviteActions fieldset{display:none!important}
#fsjCallPreparation #fsjSelectedGuests{grid-column:1/-1}
'''
def patch(a,c):
 if MARK in a:raise SystemExit('Seleção já corrigida. Atualize com Ctrl+F5.')
 if a.count(OLD)!=1:raise SystemExit('Formulário diferente do esperado. Nada alterado.')
 return a.replace(OLD,NEW),c+CSS
if __name__=='__main__':
 root=Path(sys.argv[1] if len(sys.argv)>1 else Path.home()/'fsj-video-v001');files=[root/'static/app.js',root/'static/style.css'];new=patch(*(p.read_text(encoding='utf-8') for p in files))
 b=root/'backups'/('selecao-lista-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));b.mkdir(parents=True)
 for p in files:shutil.copy2(p,b/p.name)
 try:
  for p,s in zip(files,new):
   t=p.with_suffix('.selecao.tmp');t.write_text(s,encoding='utf-8');shutil.copymode(p,t);os.replace(t,p)
 except Exception:
  for p in files:shutil.copy2(b/p.name,p)
  raise
 print('INSTALADO: selecionar o nome marca; selecionar novamente desmarca. Convidados exibidos abaixo da lista, sem caixas adicionais.')
 print('Backup:',b)
 print('Atualize com Ctrl+F5. Não precisa reiniciar a VM.')
