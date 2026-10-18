create or replace function public.fsj_escolher_folga(p_token uuid,p_dia date default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare pid text; today date=(now() at time zone 'America/Recife')::date; wk date=date_trunc('week',today::timestamp)::date; r public.folgas_semana;
begin
 select b.pessoa_id into pid from public.quadros_do_dia b join public.pessoas p on p.id=b.pessoa_id
 where b.token=p_token and b.expira_em>now() and b.dia=today and p.ativo;
 if pid is null then
  select l.pessoa_id into pid from public.links_resposta l join public.pessoas p on p.id=l.pessoa_id
  where l.token=p_token and l.expira_em>now() and l.dia=today and p.ativo
  and exists(select 1 from public.tarefa_responsaveis tr where tr.tarefa_id=l.tarefa_id and tr.pessoa_id=l.pessoa_id);
 end if;
 if pid is null then raise exception 'Link expirado ou invalido' using errcode='P0001'; end if;
 insert into public.folgas_semana(pessoa_id,semana) values(pid,wk) on conflict do nothing;
 select * into r from public.folgas_semana where pessoa_id=pid and semana=wk for update;
 if p_dia is not null then
  if r.bloqueada_gestor then raise exception 'Folga definida pelo gestor; alteracao bloqueada' using errcode='P0001'; end if;
  if p_dia<today or p_dia not between wk and wk+6 then raise exception 'Escolha uma data restante desta semana' using errcode='P0001'; end if;
  insert into public.folgas_historico(pessoa_id,semana,dia_anterior,dia_novo,definido_por) values(pid,wk,r.dia,p_dia,'empregado');
  update public.folgas_semana set dia=p_dia,definido_por='empregado',atualizado_em=now() where pessoa_id=pid and semana=wk returning * into r;
 end if;
 return to_jsonb(r)||jsonb_build_object('hoje',today,'fim_semana',wk+6);
end $$;

create or replace function public.fsj_exigir_folga_semanal() returns trigger
language plpgsql security invoker set search_path='' as $$
declare hoje date=(clock_timestamp() at time zone 'America/Recife')::date;
        semana_atual date;
begin
 if TG_TABLE_NAME='retornos' then
  if NEW.tarefa_id is null or NEW.tipo not in ('sim','nao','pergunta') then return NEW; end if;
 end if;
 semana_atual=date_trunc('week',hoje::timestamp)::date;
 if NEW.pessoa_id is not null and not exists(
  select 1 from public.folgas_semana f where f.pessoa_id=NEW.pessoa_id
  and f.semana=semana_atual and f.dia between semana_atual and semana_atual+6
 ) then
  raise exception 'FOLGA_SEMANAL_PENDENTE: Escolha e confirme pelo menos um dia de folga desta semana antes de registrar tarefas.' using errcode='P0001';
 end if;
 return NEW;
end $$;
revoke all on function public.fsj_exigir_folga_semanal() from public,anon,authenticated;
create trigger exigir_folga_antes_resposta before insert on public.retornos
for each row execute function public.fsj_exigir_folga_semanal();
create trigger exigir_folga_antes_execucao before insert or update on public.execucoes_tarefa
for each row execute function public.fsj_exigir_folga_semanal();
