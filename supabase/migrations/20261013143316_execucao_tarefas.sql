create table public.execucoes_tarefa(
 pessoa_id text not null references public.pessoas(id),tarefa_id text not null references public.tarefas(id),dia date not null,
 estado text not null check(estado in ('em_andamento','suspensa','concluida')),
 iniciado_em timestamptz not null default now(),retomado_em timestamptz not null default now(),suspenso_em timestamptz,concluido_em timestamptz,
 primary key(pessoa_id,tarefa_id,dia)
);
create unique index execucao_unica_por_empregado on public.execucoes_tarefa(pessoa_id) where estado='em_andamento';
create index execucoes_tarefa_tarefa_dia_idx on public.execucoes_tarefa(tarefa_id,dia);
create table public.execucoes_historico(id uuid primary key default gen_random_uuid(),pessoa_id text not null references public.pessoas(id),tarefa_id text not null references public.tarefas(id),dia date not null,acao text not null check(acao in ('iniciar','retomar','suspender','concluir')),criado_em timestamptz not null default now());
alter table public.execucoes_tarefa enable row level security;alter table public.execucoes_historico enable row level security;
revoke all on public.execucoes_tarefa,public.execucoes_historico from anon,authenticated;
grant select,update on public.execucoes_tarefa to authenticated;grant select,insert on public.execucoes_historico to authenticated;
grant all on public.execucoes_tarefa,public.execucoes_historico to service_role;
create policy proprietario_le_execucoes on public.execucoes_tarefa for select to authenticated using ((select auth.uid())=(select auth_user_id from public.fsj_titularidade where id));
create policy proprietario_atualiza_execucoes on public.execucoes_tarefa for update to authenticated using ((select auth.uid())=(select auth_user_id from public.fsj_titularidade where id)) with check ((select auth.uid())=(select auth_user_id from public.fsj_titularidade where id));
create policy proprietario_le_execucoes_historico on public.execucoes_historico for select to authenticated using ((select auth.uid())=(select auth_user_id from public.fsj_titularidade where id));
create policy proprietario_registra_execucoes_historico on public.execucoes_historico for insert to authenticated with check ((select auth.uid())=(select auth_user_id from public.fsj_titularidade where id));
create function public.fsj_iniciar_tarefa(p_token uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare l public.links_resposta;t public.tarefas;r public.execucoes_tarefa;old public.execucoes_tarefa;paused jsonb='[]';was_started boolean;
begin
 select * into l from public.links_resposta where token=p_token for update;
 if l.token is null or l.expira_em<=now() or l.dia<>(now() at time zone 'America/Recife')::date then raise exception 'Link expirado ou invalido';end if;
 if not exists(select 1 from public.pessoas where id=l.pessoa_id and ativo) or not exists(select 1 from public.tarefa_responsaveis where tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id) then raise exception 'Tarefa indisponivel';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('execucao|'||l.pessoa_id,0));
 select * into t from public.tarefas where id=l.tarefa_id;
 if l.respondido_em is not null or (not t.diaria and t.situacao='Concluída') or exists(select 1 from public.retornos where tarefa_id=l.tarefa_id and tipo='sim' and (not t.diaria or (criado_em>=l.dia+time '03:00' at time zone 'UTC' and criado_em<(l.dia+1)+time '03:00' at time zone 'UTC'))) then raise exception 'Tarefa ja concluida ou respondida';end if;
 select * into r from public.execucoes_tarefa where pessoa_id=l.pessoa_id and tarefa_id=l.tarefa_id and dia=l.dia;
 if r.estado='em_andamento' then return jsonb_build_object('execucao',to_jsonb(r),'suspensas',paused);end if;
 if r.estado='concluida' then raise exception 'Tarefa ja concluida';end if;
 was_started=r.pessoa_id is not null;
 for old in select * from public.execucoes_tarefa where pessoa_id=l.pessoa_id and estado='em_andamento' for update loop
  update public.execucoes_tarefa set estado='suspensa',suspenso_em=now() where pessoa_id=old.pessoa_id and tarefa_id=old.tarefa_id and dia=old.dia;
  insert into public.execucoes_historico(pessoa_id,tarefa_id,dia,acao) values(old.pessoa_id,old.tarefa_id,old.dia,'suspender');
  paused=paused||jsonb_build_array(jsonb_build_object('tarefa_id',old.tarefa_id,'tarefa',(select descricao from public.tarefas where id=old.tarefa_id),'suspenso_em',now()));
 end loop;
 insert into public.execucoes_tarefa(pessoa_id,tarefa_id,dia,estado) values(l.pessoa_id,l.tarefa_id,l.dia,'em_andamento')
 on conflict(pessoa_id,tarefa_id,dia) do update set estado='em_andamento',retomado_em=now() returning * into r;
 insert into public.execucoes_historico(pessoa_id,tarefa_id,dia,acao) values(l.pessoa_id,l.tarefa_id,l.dia,case when was_started then 'retomar' else 'iniciar' end);
 return jsonb_build_object('execucao',to_jsonb(r),'suspensas',paused);
end $$;
revoke all on function public.fsj_iniciar_tarefa(uuid) from public,anon,authenticated;grant execute on function public.fsj_iniciar_tarefa(uuid) to service_role;
create function public.fsj_encerrar_execucao_resposta() returns trigger language plpgsql security invoker set search_path='' as $$
declare d date=(new.criado_em at time zone 'America/Recife')::date;action text;
begin
 if new.tipo not in ('sim','nao') then return new;end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('execucao|'||new.pessoa_id,0));
 if new.tipo='sim' then
  update public.execucoes_tarefa set estado='concluida',concluido_em=new.criado_em where pessoa_id=new.pessoa_id and tarefa_id=new.tarefa_id and dia=d and estado<>'concluida';action='concluir';
 else
  update public.execucoes_tarefa set estado='suspensa',suspenso_em=new.criado_em where pessoa_id=new.pessoa_id and tarefa_id=new.tarefa_id and dia=d and estado='em_andamento';action='suspender';
 end if;
 if found then insert into public.execucoes_historico(pessoa_id,tarefa_id,dia,acao,criado_em) values(new.pessoa_id,new.tarefa_id,d,action,new.criado_em);end if;
 return new;
end $$;
revoke all on function public.fsj_encerrar_execucao_resposta() from public,anon,authenticated;
create trigger resposta_encerra_execucao after insert on public.retornos for each row execute function public.fsj_encerrar_execucao_resposta();
create or replace function public.fsj_supervisor_demandas(p_token uuid) returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare pid text; name text; today date=(now() at time zone 'America/Recife')::date; result jsonb;
begin
 select p.id,coalesce(nullif(p.identificacao,''),p.nome) into pid,name
 from public.quadros_do_dia b join public.pessoas p on p.id=b.pessoa_id join public.supervisores_fsj s on s.pessoa_id=p.id
 where b.token=p_token and p.ativo and s.ativo and b.dia=today and b.expira_em>now();
 if pid is null then raise exception 'Acesso de supervisao indisponivel ou link expirado' using errcode='P0001';end if;
 with allowed as materialized(select public.fsj_supervisionados(pid) id),
 groups as materialized(select g.id,g.nome from public.grupos g join public.supervisores_grupos a on a.grupo_id=g.id where a.supervisor_id=pid),
 tasks as materialized(select t.* from public.tarefas t where t.grupo_id in(select id from groups) or exists(select 1 from public.tarefa_responsaveis a where a.tarefa_id=t.id and a.pessoa_id in(select id from allowed)))
 select jsonb_build_object(
  'supervisor',name,'dia',today,'atualizado_em',now(),
  'pessoas',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'nome',coalesce(nullif(p.identificacao,''),p.nome)) order by p.nome) from public.pessoas p where p.id in(select id from allowed)),'[]'::jsonb),
  'grupos',coalesce((select jsonb_agg(to_jsonb(g) order by g.nome) from groups g),'[]'::jsonb),
  'tarefas',coalesce((select jsonb_agg(jsonb_build_object(
   'id',t.id,'descricao',t.descricao,'diaria',t.diaria,
   'situacao',case when exists(select 1 from public.retornos r where r.tarefa_id=t.id and r.tipo='sim' and (not t.diaria or (r.criado_em>=today+time '03:00' at time zone 'UTC' and r.criado_em<(today+1)+time '03:00' at time zone 'UTC'))) or (not t.diaria and t.situacao='Concluída') then 'Concluída'
    when answer.tipo='nao' then 'Pendente' when answer.tipo='pergunta' then 'Aguardando gestão' when t.diaria then 'Em aberto' else t.situacao end,
   'responsaveis',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'nome',coalesce(nullif(p.identificacao,''),p.nome)) order by p.nome) from public.tarefa_responsaveis a join public.pessoas p on p.id=a.pessoa_id where a.tarefa_id=t.id and p.id in(select id from allowed)),'[]'::jsonb),
   'grupos',coalesce((select jsonb_agg(g.id) from groups g where g.id=t.grupo_id or exists(select 1 from public.tarefa_responsaveis a join public.grupo_membros m on m.pessoa_id=a.pessoa_id where a.tarefa_id=t.id and m.grupo_id=g.id)),'[]'::jsonb),
   'execucoes',coalesce((select jsonb_agg(jsonb_build_object('responsavel',coalesce(nullif(p.identificacao,''),p.nome),'estado',e.estado,'iniciado_em',e.iniciado_em,'retomado_em',e.retomado_em,'suspenso_em',e.suspenso_em,'concluido_em',e.concluido_em) order by e.iniciado_em) from public.execucoes_tarefa e join public.pessoas p on p.id=e.pessoa_id where e.tarefa_id=t.id and e.dia=today and e.pessoa_id in(select id from allowed)),'[]'::jsonb),
   'resposta',case when answer.id is null then null else jsonb_build_object('tipo',answer.tipo,'conteudo',answer.conteudo,'criado_em',answer.criado_em,'responsavel',coalesce(nullif(answer.identificacao,''),answer.nome)) end
  ) order by t.criada_em desc,t.id) from tasks t left join lateral (
    select r.*,p.nome,p.identificacao from public.retornos r join public.pessoas p on p.id=r.pessoa_id
    where r.tarefa_id=t.id and r.pessoa_id in(select id from allowed) and (not t.diaria or (r.criado_em>=today+time '03:00' at time zone 'UTC' and r.criado_em<(today+1)+time '03:00' at time zone 'UTC'))
    order by r.criado_em desc,r.id desc limit 1
   )answer on true),'[]'::jsonb)
 ) into result;
 return result;
end $$;
