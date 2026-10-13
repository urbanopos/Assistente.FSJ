begin;

insert into public.pessoas(id,nome,identificacao,tipo,ativo) values
('_sv_test','Supervisor teste','Supervisor teste','Outro',true),('_sv_a','Pessoa autorizada A','Autorizada A','Outro',true),('_sv_b','Pessoa autorizada B','Autorizada B','Outro',true),('_sv_secret','Pessoa privada','PRIVADO','Outro',true);
insert into public.grupos(id,nome) values('_sv_group','Grupo autorizado');
insert into public.grupo_membros(grupo_id,pessoa_id) values('_sv_group','_sv_b');
insert into public.tarefas(id,descricao,grupo_id,diaria,situacao) values
('_sv_task_a','Tarefa A',null,false,'Em aberto'),('_sv_task_b','Tarefa B',null,true,'Em aberto'),
('_sv_task_group','Tarefa grupo','_sv_group',false,'Em aberto'),('_sv_shared','Tarefa compartilhada',null,false,'Em aberto'),('_sv_private','CONTEUDO_PRIVADO',null,false,'Em aberto');
insert into public.tarefa_responsaveis(tarefa_id,pessoa_id) values('_sv_task_a','_sv_a'),('_sv_task_b','_sv_b'),('_sv_task_group','_sv_b'),('_sv_shared','_sv_a'),('_sv_shared','_sv_secret'),('_sv_private','_sv_secret');
insert into public.retornos(tarefa_id,pessoa_id,origem,tipo,conteudo,criado_em) values
('_sv_shared','_sv_secret','formulario','nao','RESPOSTA_PRIVADA',now()),('_sv_task_b','_sv_b','formulario','sim','Ontem',now()-interval '1 day');
insert into public.quadros_do_dia(token,pessoa_id,dia,expira_em) values('00000000-0000-4000-8000-000000000002','_sv_test',(now() at time zone 'America/Recife')::date,now()+interval '1 hour');
set local role service_role;
do $test$
declare data jsonb;denied boolean=false;
begin
 perform public.fsj_definir_supervisor('_sv_test',true,array['_sv_a'],array['_sv_group']);
 data=public.fsj_supervisor_demandas('00000000-0000-4000-8000-000000000002');
 if jsonb_array_length(data->'tarefas')<>4 or jsonb_array_length(data->'pessoas')<>2 then raise exception 'Escopo incorreto: %',data;end if;
 if data::text like '%PRIVADO%' or data::text like '%_sv_secret%' then raise exception 'Vazamento fora do escopo';end if;
 if (select t->>'situacao' from jsonb_array_elements(data->'tarefas')t where t->>'id'='_sv_task_b')<>'Em aberto' then raise exception 'Conclusao diaria de ontem reaplicada';end if;
 if public.fsj_link_supervisao('_sv_a','00000000-0000-4000-8000-000000000002') is not null then raise exception 'Link concedido a outra pessoa';end if;
 if public.fsj_link_supervisao('_sv_test','00000000-0000-4000-8000-000000000002') is null then raise exception 'Supervisor sem link';end if;
 begin perform public.fsj_definir_supervisor('_sv_test',true,array['_missing'],array[]::text[]);exception when foreign_key_violation then denied=true;end;
 if not denied or not exists(select 1 from public.supervisores_pessoas where supervisor_id='_sv_test' and pessoa_id='_sv_a') then raise exception 'Alteracao invalida nao foi atomica';end if;
 delete from public.grupo_membros where grupo_id='_sv_group';
 data=public.fsj_supervisor_demandas('00000000-0000-4000-8000-000000000002');
 if data::text like '%_sv_task_b%' or data::text like '%Autorizada B%' then raise exception 'Membro removido manteve acesso';end if;
 update public.quadros_do_dia set dia=dia-1 where token='00000000-0000-4000-8000-000000000002';
 denied=false;begin perform public.fsj_supervisor_demandas('00000000-0000-4000-8000-000000000002');exception when sqlstate 'P0001' then denied=true;end;
 if not denied then raise exception 'Link de outro dia aceito';end if;
 update public.quadros_do_dia set dia=(now() at time zone 'America/Recife')::date where token='00000000-0000-4000-8000-000000000002';
 update public.pessoas set ativo=false where id='_sv_test';
 denied=false;begin perform public.fsj_supervisor_demandas('00000000-0000-4000-8000-000000000002');exception when sqlstate 'P0001' then denied=true;end;
 if not denied then raise exception 'Pessoa inativa acessou';end if;
 update public.pessoas set ativo=true where id='_sv_test';
 perform public.fsj_definir_supervisor('_sv_test',false,array['_sv_a'],array['_sv_group']);
 denied=false;begin perform public.fsj_supervisor_demandas('00000000-0000-4000-8000-000000000002');exception when sqlstate 'P0001' then denied=true;end;
 if not denied or public.fsj_link_supervisao('_sv_test','00000000-0000-4000-8000-000000000002') is not null then raise exception 'Revogacao da funcao nao retirou acesso';end if;
 if has_function_privilege('anon','public.fsj_supervisor_demandas(uuid)','execute') or has_table_privilege('authenticated','public.supervisores_fsj','UPDATE') then raise exception 'Permissao excessiva';end if;
end $test$;
reset role;
select 'APROVADO: escopo individual/grupo, privacidade, membro removido, diario, atomicidade, token, desativacao e revogacao' as teste;
rollback;
