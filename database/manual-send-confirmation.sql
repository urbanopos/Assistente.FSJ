create table public.fsj_envios_manuais (
 id uuid not null unique default gen_random_uuid(),
 pessoa_id text not null references public.pessoas(id),
 dia date not null,
 token uuid not null references public.quadros_do_dia(token),
 whatsapp text not null check(whatsapp ~ '^55[0-9]{10,11}$'),
 preparado_em timestamptz not null default now(),
 confirmado_em timestamptz,
 whatsapp_message_id text unique,
 mensagem_em timestamptz,
 reconciliado_em timestamptz,
 resultado_reconciliacao text,
 primary key(pessoa_id,dia)
);
alter table public.fsj_envios_manuais enable row level security;
revoke all on public.fsj_envios_manuais from anon,authenticated;
grant select on public.fsj_envios_manuais to authenticated;
grant all on public.fsj_envios_manuais to service_role;
create policy proprietario_le_envios_manuais on public.fsj_envios_manuais for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
