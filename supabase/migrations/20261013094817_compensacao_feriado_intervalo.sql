alter table public.feriados_envio drop constraint compensacao_antes_feriado;
alter table public.feriados_envio add constraint compensacao_intervalo_feriado check(folga_compensatoria is null or folga_compensatoria between dia-30 and dia+30);
create or replace function public.fsj_gestor_compensacao(p_pessoa text,p_feriado date,p_folga date) returns void language plpgsql security invoker set search_path='' as $$
declare old_day date;
begin
 if p_folga is null or p_feriado is null or p_folga not between p_feriado-30 and p_feriado+30 then raise exception 'Escolha uma data entre 30 dias antes e 30 dias depois do feriado';end if;
 if not exists(select 1 from public.feriados_fsj where dia=p_feriado) then raise exception 'Feriado nao cadastrado';end if;
 if not exists(select 1 from public.pessoas where id=p_pessoa and ativo) then raise exception 'Pessoa indisponivel';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('compensacao|'||p_pessoa||'|'||p_feriado::text,0));
 select folga_compensatoria into old_day from public.feriados_envio where pessoa_id=p_pessoa and dia=p_feriado;
 insert into public.feriados_envio(pessoa_id,dia,receber,folga_compensatoria) values(p_pessoa,p_feriado,p_folga<>p_feriado,p_folga)
 on conflict(pessoa_id,dia) do update set receber=excluded.receber,folga_compensatoria=excluded.folga_compensatoria,atualizado_em=now();
 if old_day is distinct from p_folga then insert into public.feriados_compensacao_historico(pessoa_id,feriado,dia_anterior,dia_novo) values(p_pessoa,p_feriado,old_day,p_folga);end if;
end $$;
