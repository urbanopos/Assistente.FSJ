create table public.fsj_envios_emergencia (
 id uuid primary key default gen_random_uuid(),
 dia date not null default (now() at time zone 'America/Recife')::date,
 estado text not null default 'pendente' check(estado in ('pendente','executando','concluido','falhou','expirado')),
 solicitado_em timestamptz not null default now(),
 iniciado_em timestamptz, finalizado_em timestamptz,
 resultado text
);
create unique index fsj_emergencia_unica_ativa on public.fsj_envios_emergencia(dia) where estado in ('pendente','executando');
create table public.fsj_executor_emergencia (
 id boolean primary key default true check(id),
 visto_em timestamptz not null default now()
);
alter table public.fsj_envios_emergencia enable row level security;
alter table public.fsj_executor_emergencia enable row level security;
revoke all on public.fsj_envios_emergencia,public.fsj_executor_emergencia from anon,authenticated;
grant select on public.fsj_envios_emergencia,public.fsj_executor_emergencia to authenticated;
grant all on public.fsj_envios_emergencia,public.fsj_executor_emergencia to service_role;
create policy proprietario_le_emergencia on public.fsj_envios_emergencia for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
create policy proprietario_le_executor on public.fsj_executor_emergencia for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
create function public.fsj_solicitar_emergencia() returns public.fsj_envios_emergencia
language plpgsql security invoker set search_path='' as $$
declare r public.fsj_envios_emergencia; hoje date=(now() at time zone 'America/Recife')::date;
begin
 if (now() at time zone 'America/Recife')::time < time '07:00' then raise exception 'Envio disponivel a partir das 7h'; end if;
 if not exists(select 1 from public.fsj_executor_emergencia where visto_em>now()-interval '2 minutes') then raise exception 'Executor de emergencia indisponivel. Ative a ligacao no computador.'; end if;
 -- One pending/running request per day, including concurrent clicks.
 insert into public.fsj_envios_emergencia(dia) values(hoje)
 on conflict(dia) where estado in ('pendente','executando') do update set dia=excluded.dia returning * into r;
 return r;
end $$;
create function public.fsj_assumir_emergencia() returns setof public.fsj_envios_emergencia
language plpgsql security invoker set search_path='' as $$
declare hoje date=(now() at time zone 'America/Recife')::date; selected uuid;
begin
 insert into public.fsj_executor_emergencia(id,visto_em) values(true,now()) on conflict(id) do update set visto_em=excluded.visto_em;
 update public.fsj_envios_emergencia set estado='expirado',finalizado_em=now(),resultado='Pedido de outro dia; nenhum envio executado.' where estado='pendente' and dia<>hoje;
 if (now() at time zone 'America/Recife')::time < time '07:00' then return;end if;
 select id into selected from public.fsj_envios_emergencia where estado='pendente' and dia=hoje order by solicitado_em for update skip locked limit 1;
 if selected is null then return;end if;
 return query update public.fsj_envios_emergencia set estado='executando',iniciado_em=now() where id=selected returning *;
end $$;
revoke all on function public.fsj_solicitar_emergencia(),public.fsj_assumir_emergencia() from public,anon,authenticated;
grant execute on function public.fsj_solicitar_emergencia(),public.fsj_assumir_emergencia() to service_role;
