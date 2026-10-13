alter table public.feriados_envio add column folga_compensatoria date;
alter table public.feriados_envio add constraint compensacao_antes_feriado check(folga_compensatoria is null or folga_compensatoria between dia-30 and dia-1);
create index feriados_envio_compensacao_idx on public.feriados_envio(pessoa_id,folga_compensatoria) where folga_compensatoria is not null;
create table public.feriados_compensacao_historico(id uuid primary key default gen_random_uuid(),pessoa_id text not null references public.pessoas(id),feriado date not null references public.feriados_fsj(dia),dia_anterior date,dia_novo date not null,criado_em timestamptz not null default now());
alter table public.feriados_compensacao_historico enable row level security;
revoke all on public.feriados_compensacao_historico from anon,authenticated;
grant select on public.feriados_compensacao_historico to authenticated;
grant all on public.feriados_compensacao_historico to service_role;
create policy proprietario_le_compensacoes on public.feriados_compensacao_historico for select to authenticated using ((select auth.uid())=(select auth_user_id from public.fsj_titularidade where id));
create function public.fsj_gestor_compensacao(p_pessoa text,p_feriado date,p_folga date) returns void language plpgsql security invoker set search_path='' as $$
declare old_day date;
begin
 if p_folga is null or p_feriado is null or p_folga not between p_feriado-30 and p_feriado-1 then raise exception 'Escolha uma data nos 30 dias anteriores ao feriado';end if;
 if not exists(select 1 from public.feriados_fsj where dia=p_feriado) then raise exception 'Feriado nao cadastrado';end if;
 if not exists(select 1 from public.pessoas where id=p_pessoa and ativo) then raise exception 'Pessoa indisponivel';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('compensacao|'||p_pessoa||'|'||p_feriado::text,0));
 select folga_compensatoria into old_day from public.feriados_envio where pessoa_id=p_pessoa and dia=p_feriado;
 insert into public.feriados_envio(pessoa_id,dia,receber,folga_compensatoria) values(p_pessoa,p_feriado,true,p_folga)
 on conflict(pessoa_id,dia) do update set receber=true,folga_compensatoria=excluded.folga_compensatoria,atualizado_em=now();
 if old_day is distinct from p_folga then insert into public.feriados_compensacao_historico(pessoa_id,feriado,dia_anterior,dia_novo) values(p_pessoa,p_feriado,old_day,p_folga);end if;
end $$;
revoke all on function public.fsj_gestor_compensacao(text,date,date) from public,anon,authenticated;
grant execute on function public.fsj_gestor_compensacao(text,date,date) to service_role;
create or replace function public.fsj_pode_enviar(p_pessoa text,p_dia date) returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.pessoas p where p.id=p_pessoa and p.ativo and p.receber_tarefas_whatsapp
 and not(p_dia=any(p.folgas_datas))
 and not exists(select 1 from public.folgas_semana f where f.pessoa_id=p.id and f.dia=p_dia)
 and not exists(select 1 from public.feriados_envio c where c.pessoa_id=p.id and c.folga_compensatoria=p_dia)
 and (not exists(select 1 from public.feriados_fsj h where h.dia=p_dia)
 or exists(select 1 from public.feriados_envio e where e.pessoa_id=p.id and e.dia=p_dia and e.receber)))
$$;
