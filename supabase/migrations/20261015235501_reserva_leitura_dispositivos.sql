create table public.fsj_reserva_leituras(pessoa_id text not null references public.pessoas(id) on delete cascade,dia date not null,lido_em timestamptz not null default now(),primary key(pessoa_id,dia));
alter table public.fsj_reserva_leituras enable row level security;
revoke all on public.fsj_reserva_leituras from anon,authenticated;grant all on public.fsj_reserva_leituras to service_role;
grant select on public.fsj_reserva_leituras to authenticated;
create policy proprietario_le_reserva on public.fsj_reserva_leituras for select to authenticated using ((select auth.uid())=(select auth_user_id from public.fsj_titularidade where id));
create table public.fsj_reserva_dispositivos(device_id uuid primary key,pessoa_id text not null references public.pessoas(id) on delete cascade,chave_hash text not null unique check(chave_hash ~ '^[0-9a-f]{64}$'),ativo boolean not null default true,criado_em timestamptz not null default now(),expira_em timestamptz not null default now()+interval '90 days');
alter table public.fsj_reserva_dispositivos enable row level security;
revoke all on public.fsj_reserva_dispositivos from anon,authenticated;grant all on public.fsj_reserva_dispositivos to service_role;
