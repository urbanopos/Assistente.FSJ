begin;
insert into public.pessoas(id,nome,tipo,ativo) values('_mi_employee','Empregado de teste','Outro',true),('_mi_supervisor','Supervisor de teste','Outro',true);
insert into public.tarefas(id,descricao) values('_mi_task','Tarefa sem ferramenta'),('_mi_sim','Tarefa concluida');
insert into public.tarefa_responsaveis values('_mi_task','_mi_employee'),('_mi_sim','_mi_employee');
insert into public.links_resposta(token,tarefa_id,pessoa_id,dia,expira_em) values('00000000-0000-4000-8000-000000000031','_mi_task','_mi_employee',(now() at time zone 'America/Recife')::date,now()+interval '1 hour'),('00000000-0000-4000-8000-000000000032','_mi_sim','_mi_employee',(now() at time zone 'America/Recife')::date,now()+interval '1 hour');
insert into public.quadros_do_dia(token,pessoa_id,dia,expira_em) values('00000000-0000-4000-8000-000000000033','_mi_supervisor',(now() at time zone 'America/Recife')::date,now()+interval '1 hour');
set local role service_role;
do $$
declare r jsonb;d jsonb;blocked boolean=false;owner_id text;
begin
 perform public.fsj_definir_supervisor('_mi_supervisor',true,array['_mi_employee']);
 r=public.fsj_registrar_resposta('00000000-0000-4000-8000-000000000031','nao','Nao havia ferramenta','Uma enxada');
 select pessoa_id into owner_id from public.fsj_titularidade;
 if not exists(select 1 from public.tarefa_responsaveis where tarefa_id=r->>'tarefa_proprietario_id' and pessoa_id=owner_id) then raise exception 'Demanda sem proprietario';end if;
 if not exists(select 1 from public.retornos where id=(r->>'id')::uuid and itens_faltantes='Uma enxada' and tarefa_proprietario_id=r->>'tarefa_proprietario_id') then raise exception 'Vinculo perdido';end if;
 begin perform public.fsj_registrar_resposta('00000000-0000-4000-8000-000000000031','nao','Nao havia ferramenta','Uma enxada');exception when unique_violation then blocked=true;end;
 if not blocked or (select count(*) from public.retornos where tarefa_id='_mi_task')<>1 then raise exception 'Duplicacao';end if;
 d=public.fsj_supervisor_demandas('00000000-0000-4000-8000-000000000033');
 if d::text not like '%Itens Faltantes: Uma enxada%' or d::text not like '%Demanda encaminhada ao Proprietário%' then raise exception 'Supervisor sem aviso';end if;
 if d::text like '%'||(r->>'tarefa_proprietario_id')||'%' then raise exception 'Demanda privada do proprietario exposta';end if;
 blocked=false;begin perform public.fsj_registrar_resposta('00000000-0000-4000-8000-000000000032','sim','','Invalido');exception when invalid_parameter_value then blocked=true;end;
 if not blocked or exists(select 1 from public.retornos where tarefa_id='_mi_sim') then raise exception 'SIM com itens aceito';end if;
 r=public.fsj_registrar_resposta('00000000-0000-4000-8000-000000000032','sim','','');
 if r->>'tarefa_proprietario_id' is not null then raise exception 'SIM gerou demanda';end if;
 if has_function_privilege('anon','public.fsj_registrar_resposta(uuid,text,text,text)','EXECUTE') or has_function_privilege('authenticated','public.fsj_registrar_resposta(uuid,text,text,text)','EXECUTE') then raise exception 'RPC publica';end if;
end $$;
reset role;
select 'APROVADO: demanda do proprietario, aviso ao supervisor, privacidade, duplicacao, SIM e permissoes' as teste;
rollback;
