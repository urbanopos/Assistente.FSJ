alter table public.pessoas add column ferias_inicio date, add column ferias_fim date;
alter table public.pessoas add constraint ferias_periodo_valido check((ferias_inicio is null and ferias_fim is null) or (ferias_inicio is not null and ferias_fim is not null and ferias_inicio<=ferias_fim));
create or replace function public.fsj_pode_enviar(p_pessoa text,p_dia date) returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.pessoas p where p.id=p_pessoa and p.ativo and p.receber_tarefas_whatsapp
 and not(p_dia=any(p.folgas_datas))
 and (p.ferias_inicio is null or p_dia not between p.ferias_inicio and p.ferias_fim)
 and not exists(select 1 from public.folgas_semana f where f.pessoa_id=p.id and f.dia=p_dia)
 and not exists(select 1 from public.feriados_envio c where c.pessoa_id=p.id and c.folga_compensatoria=p_dia)
 and (not exists(select 1 from public.feriados_fsj h where h.dia=p_dia)
 or exists(select 1 from public.feriados_envio e where e.pessoa_id=p.id and e.dia=p_dia and e.receber)))
$$;
