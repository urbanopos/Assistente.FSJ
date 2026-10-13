-- Administrative ownership declared by Urbano; not an INPI registration or a transfer of third-party rights.
create table public.fsj_titularidade (
 id boolean primary key default true check(id),
 pessoa_id text not null unique references public.pessoas(id) on delete restrict,
 auth_user_id uuid not null unique references auth.users(id) on delete restrict,
 nome_titular text not null,
 papel text not null default 'Proprietário' check(papel='Proprietário'),
 registrado_em timestamptz not null default now()
);
alter table public.fsj_titularidade enable row level security;
revoke all on public.fsj_titularidade from anon,authenticated;
grant select on public.fsj_titularidade to authenticated;
grant all on public.fsj_titularidade to service_role;
create policy proprietario_le_titularidade on public.fsj_titularidade for select to authenticated
 using ((select auth.uid())=auth_user_id);
insert into public.fsj_titularidade(id,pessoa_id,auth_user_id,nome_titular)
select true,'mv50jljyyfy7',id,'Urbano Possidônio de Carvalho Junior' from auth.users where lower(email)='urbanopos@yahoo.com.br';
do $$begin if not exists(select 1 from public.fsj_titularidade) then raise exception 'Conta do proprietario nao encontrada';end if;end $$;
