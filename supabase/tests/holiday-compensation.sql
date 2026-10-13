begin;
insert into public.pessoas(id,nome,tipo,ativo,receber_tarefas_whatsapp) values('_comp_test','Pessoa teste','Outro',true,true);
insert into public.feriados_fsj(dia,nome,ambito,fonte) values('2026-10-12','Feriado teste','Teste','https://example.invalid') on conflict do nothing;
insert into public.folgas_semana(pessoa_id,semana,dia,definido_por) values('_comp_test','2026-10-12','2026-10-14','empregado');
set local role service_role;
do $$
declare blocked boolean=false;
begin
 perform public.fsj_gestor_compensacao('_comp_test','2026-10-12','2026-10-09');
 if public.fsj_pode_enviar('_comp_test','2026-10-09') then raise exception 'Envio na compensacao';end if;
 if not public.fsj_pode_enviar('_comp_test','2026-10-12') then raise exception 'Feriado sem autorizacao';end if;
 if public.fsj_pode_enviar('_comp_test','2026-10-14') then raise exception 'Folga semanal perdida';end if;
 if not exists(select 1 from public.folgas_semana where pessoa_id='_comp_test' and dia='2026-10-14' and definido_por='empregado') then raise exception 'Folga semanal alterada';end if;
 perform public.fsj_gestor_compensacao('_comp_test','2026-10-12','2026-10-09');
 if (select count(*) from public.feriados_compensacao_historico where pessoa_id='_comp_test')<>1 then raise exception 'Historico duplicado';end if;
 begin perform public.fsj_gestor_compensacao('_comp_test','2026-10-12','2026-11-12');exception when others then blocked=true;end;
 if not blocked then raise exception 'Data fora do intervalo aceita';end if;
 perform public.fsj_gestor_compensacao('_comp_test','2026-10-12','2026-10-12');
 if public.fsj_pode_enviar('_comp_test','2026-10-12') then raise exception 'Mensagem em feriado de folga';end if;
 perform public.fsj_gestor_compensacao('_comp_test','2026-10-12','2026-10-15');
 if public.fsj_pode_enviar('_comp_test','2026-10-15') or not public.fsj_pode_enviar('_comp_test','2026-10-12') then raise exception 'Compensacao posterior incorreta';end if;
 if has_function_privilege('anon','public.fsj_gestor_compensacao(text,date,date)','execute') or has_function_privilege('authenticated','public.fsj_gestor_compensacao(text,date,date)','execute') then raise exception 'Permissao excessiva';end if;
end $$;
reset role;
select 'APROVADO: compensacao separada, feriado autorizado, folga semanal preservada, historico e permissoes' as teste;
rollback;
