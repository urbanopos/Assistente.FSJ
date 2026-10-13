create table public.supervisores_fsj (
 pessoa_id text primary key references public.pessoas(id) on delete cascade,
 ativo boolean not null default false, atualizado_em timestamptz not null default now()
);
create table public.supervisores_pessoas (
 supervisor_id text not null references public.supervisores_fsj(pessoa_id) on delete cascade,
 pessoa_id text not null references public.pessoas(id) on delete cascade,
 primary key(supervisor_id,pessoa_id)
);
create table public.supervisores_grupos (
 supervisor_id text not null references public.supervisores_fsj(pessoa_id) on delete cascade,
 grupo_id text not null references public.grupos(id) on delete cascade,
 primary key(supervisor_id,grupo_id)
);
create index supervisores_pessoas_pessoa_idx on public.supervisores_pessoas(pessoa_id);
create index supervisores_grupos_grupo_idx on public.supervisores_grupos(grupo_id);
alter table public.supervisores_fsj enable row level security;
alter table public.supervisores_pessoas enable row level security;
alter table public.supervisores_grupos enable row level security;
revoke all on public.supervisores_fsj,public.supervisores_pessoas,public.supervisores_grupos from anon,authenticated;
grant select on public.supervisores_fsj,public.supervisores_pessoas,public.supervisores_grupos to authenticated;
grant all on public.supervisores_fsj,public.supervisores_pessoas,public.supervisores_grupos to service_role;
create policy gestor_le_supervisores on public.supervisores_fsj for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
create policy gestor_le_supervisores_pessoas on public.supervisores_pessoas for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
create policy gestor_le_supervisores_grupos on public.supervisores_grupos for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');

create function public.fsj_definir_supervisor(p_pessoa text,p_ativo boolean,p_pessoas text[] default '{}',p_grupos text[] default '{}') returns void
language plpgsql security invoker set search_path='' as $$
begin
 if p_ativo is null or p_pessoas is null or p_grupos is null or array_position(p_pessoas,null) is not null or array_position(p_grupos,null) is not null then raise exception 'Configuracao invalida';end if;
 if p_ativo and cardinality(p_pessoas)+cardinality(p_grupos)=0 then raise exception 'Selecione pessoas ou grupos para supervisionar';end if;
 if p_ativo and not exists(select 1 from public.pessoas where id=p_pessoa and ativo) then raise exception 'Supervisor precisa de cadastro ativo';end if;
 insert into public.supervisores_fsj(pessoa_id,ativo) values(p_pessoa,p_ativo)
 on conflict(pessoa_id) do update set ativo=excluded.ativo,atualizado_em=now();
 -- The supervisor row serializes concurrent changes; invalid targets roll back the entire update.
 delete from public.supervisores_pessoas where supervisor_id=p_pessoa;
 delete from public.supervisores_grupos where supervisor_id=p_pessoa;
 insert into public.supervisores_pessoas select p_pessoa,x from (select distinct unnest(p_pessoas) x)s;
 insert into public.supervisores_grupos select p_pessoa,x from (select distinct unnest(p_grupos) x)s;
end $$;

create function public.fsj_supervisionados(p_supervisor text) returns setof text language sql stable security invoker set search_path='' as $$
 select p.id from public.pessoas p where p.ativo and (exists(select 1 from public.supervisores_pessoas a where a.supervisor_id=p_supervisor and a.pessoa_id=p.id)
 or exists(select 1 from public.supervisores_grupos s join public.grupo_membros m on m.grupo_id=s.grupo_id where s.supervisor_id=p_supervisor and m.pessoa_id=p.id))
$$;

create function public.fsj_link_supervisao(p_pessoa text,p_token uuid) returns text language sql stable security invoker set search_path='' as $$
 select 'https://urbanopos.github.io/Assistente.FSJ/supervisor.html#token='||b.token::text
 from public.quadros_do_dia b join public.pessoas p on p.id=b.pessoa_id join public.supervisores_fsj s on s.pessoa_id=p.id
 where b.token=p_token and p.id=p_pessoa and p.ativo and s.ativo and b.expira_em>now() and b.dia=(now() at time zone 'America/Recife')::date
$$;

create function public.fsj_supervisor_demandas(p_token uuid) returns jsonb language plpgsql stable security invoker set search_path='' as $$
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
   'resposta',case when answer.id is null then null else jsonb_build_object('tipo',answer.tipo,'conteudo',answer.conteudo,'criado_em',answer.criado_em,'responsavel',coalesce(nullif(answer.identificacao,''),answer.nome)) end
  ) order by t.criada_em desc,t.id) from tasks t left join lateral (
    select r.*,p.nome,p.identificacao from public.retornos r join public.pessoas p on p.id=r.pessoa_id
    where r.tarefa_id=t.id and r.pessoa_id in(select id from allowed) and (not t.diaria or (r.criado_em>=today+time '03:00' at time zone 'UTC' and r.criado_em<(today+1)+time '03:00' at time zone 'UTC'))
    order by r.criado_em desc,r.id desc limit 1
   )answer on true),'[]'::jsonb)
 ) into result;
 return result;
end $$;
revoke all on function public.fsj_definir_supervisor(text,boolean,text[],text[]),public.fsj_supervisionados(text),public.fsj_link_supervisao(text,uuid),public.fsj_supervisor_demandas(uuid) from public,anon,authenticated;
grant execute on function public.fsj_definir_supervisor(text,boolean,text[],text[]),public.fsj_supervisionados(text),public.fsj_link_supervisao(text,uuid),public.fsj_supervisor_demandas(uuid) to service_role;
