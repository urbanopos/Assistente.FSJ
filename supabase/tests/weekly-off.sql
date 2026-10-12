begin;

insert into public.pessoas(id,nome,identificacao,whatsapp,tipo,ativo,receber_tarefas_whatsapp) values('_fsj_weekly_test','Teste isolado','Teste','5581999999999','Funcionário',true,true);
insert into public.quadros_do_dia(token,pessoa_id,dia,expira_em) values('00000000-0000-4000-8000-000000000001','_fsj_weekly_test',(now() at time zone 'America/Recife')::date,now()+interval '1 hour');
set local role service_role;
do $test$
declare td date=(now() at time zone 'America/Recife')::date; w date=date_trunc('week',td::timestamp)::date; j jsonb; blocked boolean=false;
begin
 j=public.fsj_escolher_folga('00000000-0000-4000-8000-000000000001',td);
 if public.fsj_pode_enviar('_fsj_weekly_test',td) then raise exception 'Folga nao bloqueou envio';end if;
 perform public.fsj_gestor_folga('_fsj_weekly_test',w,w+6);
 begin perform public.fsj_escolher_folga('00000000-0000-4000-8000-000000000001',td);exception when sqlstate 'P0001' then blocked=true;end;
 if not blocked then raise exception 'Empregado conseguiu alterar data do gestor';end if;
 if (select dia from public.folgas_semana where pessoa_id='_fsj_weekly_test' and semana=w)<>w+6 then raise exception 'Data do gestor modificada';end if;
 insert into public.feriados_fsj values(td+8,'Teste feriado','Teste','https://example.invalid');
 if public.fsj_pode_enviar('_fsj_weekly_test',td+8) then raise exception 'Feriado sem decisao permitiu envio';end if;
 insert into public.feriados_envio(pessoa_id,dia,receber) values('_fsj_weekly_test',td+8,true);
 if not public.fsj_pode_enviar('_fsj_weekly_test',td+8) then raise exception 'Decisao positiva nao liberou envio';end if;
 update public.feriados_envio set receber=false where pessoa_id='_fsj_weekly_test';
 if public.fsj_pode_enviar('_fsj_weekly_test',td+8) then raise exception 'Decisao negativa permitiu envio';end if;
 if has_function_privilege('anon','public.fsj_escolher_folga(uuid,date)','EXECUTE') or has_table_privilege('authenticated','public.folgas_semana','UPDATE') then raise exception 'Permissoes publicas excessivas';end if;
 if (select count(*) from public.folgas_historico where pessoa_id='_fsj_weekly_test')<>2 then raise exception 'Historico incorreto';end if;
end $test$;
reset role;
select 'APROVADO: escolha, bloqueio por gestor, feriado pendente/SIM/NAO, historico e permissoes' as teste;
rollback;
