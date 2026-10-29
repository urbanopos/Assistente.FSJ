-- Suspensão pelo mesmo token individual usado para iniciar/responder.
create or replace function public.fsj_suspender_tarefa(p_token uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare l public.links_resposta; t public.tarefas; r public.execucoes_tarefa;
begin
 select * into l from public.links_resposta where token=p_token for update;
 if l.token is null or not public.fsj_link_resposta_vigente(p_token) then raise exception 'Link expirado ou invalido'; end if;
 if not exists(select 1 from public.pessoas where id=l.pessoa_id and ativo and tipo is distinct from 'Visitante')
 or not exists(select 1 from public.tarefa_responsaveis where tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id) then raise exception 'Tarefa indisponivel'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('execucao|'||l.pessoa_id,0));
 select * into t from public.tarefas where id=l.tarefa_id for update;
 if t.id is null or t.situacao='Arquivado' or l.respondido_em is not null then raise exception 'Tarefa indisponivel ou respondida';end if;
 select * into r from public.execucoes_tarefa where pessoa_id=l.pessoa_id and tarefa_id=l.tarefa_id and dia=l.dia for update;
 if r.estado='suspensa' then return jsonb_build_object('execucao',to_jsonb(r));end if;
 if r.estado is distinct from 'em_andamento' then raise exception 'Tarefa nao esta em andamento';end if;
 update public.execucoes_tarefa set estado='suspensa',suspenso_em=now()
 where pessoa_id=l.pessoa_id and tarefa_id=l.tarefa_id and dia=l.dia returning * into r;
 insert into public.execucoes_historico(pessoa_id,tarefa_id,dia,acao) values(l.pessoa_id,l.tarefa_id,l.dia,'suspender');
 return jsonb_build_object('execucao',to_jsonb(r));
end $$;
revoke all on function public.fsj_suspender_tarefa(uuid) from public,anon,authenticated;
grant execute on function public.fsj_suspender_tarefa(uuid) to service_role;
