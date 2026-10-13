begin;
insert into public.pessoas(id,nome,tipo,ativo,receber_tarefas_whatsapp,ferias_inicio,ferias_fim) values('_vac_test','Pessoa teste','Outro',true,true,'2026-10-20','2026-11-04');
set local role service_role;
do $$
declare d date;blocked boolean=false;
begin
 for d in select generate_series(date '2026-10-20',date '2026-11-04',interval '1 day')::date loop
 if public.fsj_pode_enviar('_vac_test',d) then raise exception 'Mensagem durante ferias: %',d;end if;
 end loop;
 if not public.fsj_pode_enviar('_vac_test','2026-10-19') or not public.fsj_pode_enviar('_vac_test','2026-11-05') then raise exception 'Dias externos bloqueados';end if;
 begin update public.pessoas set ferias_fim=null where id='_vac_test';exception when check_violation then blocked=true;end;
 if not blocked then raise exception 'Periodo incompleto aceito';end if;
 blocked=false;begin update public.pessoas set ferias_fim='2026-10-19' where id='_vac_test';exception when check_violation then blocked=true;end;
 if not blocked then raise exception 'Periodo invertido aceito';end if;
 update public.pessoas set ferias_inicio=null,ferias_fim=null where id='_vac_test';
 if not public.fsj_pode_enviar('_vac_test','2026-10-20') then raise exception 'Remocao nao liberou';end if;
end $$;
reset role;
select 'APROVADO: ferias bloqueiam periodo inclusivo, datas externas, validacao e remocao' as teste;
rollback;
