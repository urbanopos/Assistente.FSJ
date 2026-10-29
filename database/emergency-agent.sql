-- Executor dedicado: preparado para instalação; não altera a rotina das 7h.
create table public.fsj_emergency_agent (
 id boolean primary key default true check(id),
 visto_em timestamptz not null,
 conectado boolean not null default false
);
create table public.fsj_emergency_jobs (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique,
 pessoa_id text not null references public.pessoas(id),
 dia date not null,
 phone text not null check(phone ~ '^55[0-9]{10,11}$'),
 mensagem text not null,
 codigo text not null,
 estado text not null default 'pendente' check(estado in ('pendente','executando','pronto_para_envio','enviado','bloqueado','incerto','expirado')),
 criado_em timestamptz not null default now(),
 iniciado_em timestamptz,
 finalizado_em timestamptz,
 resultado text,
 whatsapp_message_id text
);
create unique index fsj_emergency_job_once_day on public.fsj_emergency_jobs(pessoa_id,dia) where estado in ('pendente','executando','pronto_para_envio','enviado','incerto');
alter table public.fsj_emergency_agent enable row level security;
alter table public.fsj_emergency_jobs enable row level security;
revoke all on public.fsj_emergency_agent,public.fsj_emergency_jobs from public,anon,authenticated;
grant all on public.fsj_emergency_agent,public.fsj_emergency_jobs to service_role;
create function public.fsj_emergency_claim() returns setof public.fsj_emergency_jobs
language plpgsql security invoker set search_path='' as $$
declare selected uuid;
begin
 update public.fsj_emergency_jobs set estado='expirado',finalizado_em=now(),resultado='Pedido de outro dia: não executado.'
 where estado='pendente' and dia<>(now() at time zone 'America/Recife')::date;
 -- Nunca reassumir automaticamente uma execução interrompida: pode ter enviado.
 select id into selected from public.fsj_emergency_jobs where estado='pendente'
 order by criado_em for update skip locked limit 1;
 if selected is null then return;end if;
 return query update public.fsj_emergency_jobs set estado='executando',iniciado_em=now() where id=selected returning *;
end $$;
revoke all on function public.fsj_emergency_claim() from public,anon,authenticated;
grant execute on function public.fsj_emergency_claim() to service_role;
