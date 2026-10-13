begin;
insert into public.pessoas(id,nome,tipo,ativo) values('_exec_a','Empregado A','Outro',true),('_exec_b','Empregado B','Outro',true);
insert into public.tarefas(id,descricao) values('_exec_1','Tarefa 1'),('_exec_2','Tarefa 2');
insert into public.tarefa_responsaveis(tarefa_id,pessoa_id) values('_exec_1','_exec_a'),('_exec_2','_exec_a'),('_exec_2','_exec_b');
insert into public.links_resposta(token,pessoa_id,tarefa_id,dia,expira_em) values
('00000000-0000-4000-8000-000000000061','_exec_a','_exec_1',(now() at time zone 'America/Recife')::date,now()+interval '1 hour'),
('00000000-0000-4000-8000-000000000062','_exec_a','_exec_2',(now() at time zone 'America/Recife')::date,now()+interval '1 hour'),
('00000000-0000-4000-8000-000000000063','_exec_b','_exec_2',(now() at time zone 'America/Recife')::date,now()+interval '1 hour');
set local role service_role;
do $$
declare first_start timestamptz;data jsonb;blocked boolean=false;
begin
 data=public.fsj_iniciar_tarefa('00000000-0000-4000-8000-000000000061');first_start=(data->'execucao'->>'iniciado_em')::timestamptz;
 perform public.fsj_iniciar_tarefa('00000000-0000-4000-8000-000000000061');
 if (select count(*) from public.execucoes_historico where pessoa_id='_exec_a')<>1 then raise exception 'Inicio repetido duplicou evento';end if;
 data=public.fsj_iniciar_tarefa('00000000-0000-4000-8000-000000000062');
 if jsonb_array_length(data->'suspensas')<>1 or not exists(select 1 from public.execucoes_tarefa where pessoa_id='_exec_a' and tarefa_id='_exec_1' and estado='suspensa' and suspenso_em is not null) then raise exception 'Anterior nao suspensa';end if;
 perform public.fsj_iniciar_tarefa('00000000-0000-4000-8000-000000000063');
 if (select count(*) from public.execucoes_tarefa where estado='em_andamento')<>2 then raise exception 'Empregados independentes';end if;
 perform public.fsj_iniciar_tarefa('00000000-0000-4000-8000-000000000061');
 if not exists(select 1 from public.execucoes_tarefa where pessoa_id='_exec_a' and tarefa_id='_exec_1' and iniciado_em=first_start and estado='em_andamento') then raise exception 'Retomada perdeu inicio';end if;
 begin update public.execucoes_tarefa set estado='em_andamento' where pessoa_id='_exec_a' and tarefa_id='_exec_2';exception when unique_violation then blocked=true;end;
 if not blocked then raise exception 'Duas execucoes aceitas';end if;
 perform public.fsj_registrar_resposta('00000000-0000-4000-8000-000000000061','sim','','');
 if not exists(select 1 from public.execucoes_tarefa where pessoa_id='_exec_a' and tarefa_id='_exec_1' and estado='concluida' and concluido_em is not null) then raise exception 'SIM nao concluiu execucao';end if;
 blocked=false;begin perform public.fsj_iniciar_tarefa('00000000-0000-4000-8000-000000000061');exception when others then blocked=true;end;
 if not blocked then raise exception 'Concluida reiniciada';end if;
 perform public.fsj_registrar_resposta('00000000-0000-4000-8000-000000000063','nao','Pendente','');
 if exists(select 1 from public.execucoes_tarefa where pessoa_id='_exec_b' and estado='em_andamento') then raise exception 'NAO manteve em andamento';end if;
 if has_function_privilege('anon','public.fsj_iniciar_tarefa(uuid)','execute') or has_function_privilege('authenticated','public.fsj_iniciar_tarefa(uuid)','execute') then raise exception 'RPC exposta';end if;
end $$;
reset role;
select 'APROVADO: inicio, suspensao, retomada, exclusividade por empregado, conclusao, NAO e permissoes' as teste;
rollback;
