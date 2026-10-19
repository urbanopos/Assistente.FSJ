-- Cada ocorrencia nao diaria conserva seu numero e historico de respostas.
alter table public.tarefas add column periodicidade text;
update public.tarefas set periodicidade=case when diaria then 'diaria' else 'pontual' end;
alter table public.tarefas alter column periodicidade set not null;
alter table public.tarefas add constraint tarefas_periodicidade_valida check (periodicidade in ('pontual','diaria','semanal','mensal','trimestral','semestral','anual'));
alter table public.tarefas add column referencia_repeticao date;
alter table public.tarefas add column repeticao_indice integer not null default 0 check (repeticao_indice>=0);
alter table public.tarefas add column proxima_repeticao date;
alter table public.tarefas add column ocorrencia_anterior_id text unique;
create schema if not exists fsj_internal;
revoke all on schema fsj_internal from public, anon, authenticated;
create function fsj_internal.vencimento(ref date, frequencia text, indice integer) returns date
language sql immutable strict set search_path=pg_catalog as $$
 select case frequencia
 when 'semanal' then ref+7*indice
 when 'mensal' then (ref+make_interval(months=>indice))::date
 when 'trimestral' then (ref+make_interval(months=>3*indice))::date
 when 'semestral' then (ref+make_interval(months=>6*indice))::date
 when 'anual' then (ref+make_interval(years=>indice))::date
 else null end
$$;
create function public.fsj_configurar_periodicidade() returns trigger
language plpgsql security invoker set search_path=pg_catalog,public as $$
begin
 if tg_op='INSERT' then
  new.periodicidade:=coalesce(new.periodicidade,case when new.diaria then 'diaria' else 'pontual' end);
 elsif new.periodicidade is not distinct from old.periodicidade and new.diaria is distinct from old.diaria then
  new.periodicidade:=case when new.diaria then 'diaria' else 'pontual' end;
 end if;
 new.diaria:=new.periodicidade='diaria';
 if tg_op='INSERT' then
  new.referencia_repeticao:=coalesce(new.referencia_repeticao,(new.criada_em at time zone 'America/Recife')::date);
 elsif new.periodicidade is distinct from old.periodicidade then
  new.referencia_repeticao:=(now() at time zone 'America/Recife')::date;
  new.repeticao_indice:=0;
 end if;
 -- Calculo inline para que gravacao autenticada nao precise acessar schema interno.
 if new.periodicidade in ('pontual','diaria') then new.proxima_repeticao:=null;
 else
  new.proxima_repeticao:=case new.periodicidade
   when 'semanal' then new.referencia_repeticao+7*(new.repeticao_indice+1)
   when 'mensal' then (new.referencia_repeticao+make_interval(months=>new.repeticao_indice+1))::date
   when 'trimestral' then (new.referencia_repeticao+make_interval(months=>3*(new.repeticao_indice+1)))::date
   when 'semestral' then (new.referencia_repeticao+make_interval(months=>6*(new.repeticao_indice+1)))::date
   when 'anual' then (new.referencia_repeticao+make_interval(years=>new.repeticao_indice+1))::date end;
  if exists(select 1 from public.tarefas where ocorrencia_anterior_id=new.id) then new.proxima_repeticao:=null;end if;
 end if;
 return new;
end $$;
revoke all on function public.fsj_configurar_periodicidade() from public,anon,authenticated;
create trigger fsj_periodicidade before insert or update on public.tarefas for each row execute function public.fsj_configurar_periodicidade();
create index tarefas_repeticao_vencimento on public.tarefas(proxima_repeticao) where proxima_repeticao is not null;
create function fsj_internal.gerar_ocorrencias() returns integer
language plpgsql security invoker set search_path=pg_catalog,public,fsj_internal as $$
declare t public.tarefas; novo_id text; today date:=(now() at time zone 'America/Recife')::date; indice integer; total integer:=0;
begin
 for t in select * from public.tarefas where proxima_repeticao<=today and situacao='Concluída' for update skip locked loop
  if exists(select 1 from public.tarefas where ocorrencia_anterior_id=t.id) then continue;end if;
  indice:=t.repeticao_indice+1;
  while fsj_internal.vencimento(t.referencia_repeticao,t.periodicidade,indice+1)<=today loop indice:=indice+1;end loop;
  novo_id:=gen_random_uuid()::text;
  insert into public.tarefas(id,descricao,grupo_id,diaria,periodicidade,prioridade,situacao,referencia_repeticao,repeticao_indice,ocorrencia_anterior_id)
  values(novo_id,t.descricao,t.grupo_id,false,t.periodicidade,t.prioridade,'Em aberto',t.referencia_repeticao,indice,t.id);
  insert into public.tarefa_responsaveis(tarefa_id,pessoa_id) select novo_id,pessoa_id from public.tarefa_responsaveis where tarefa_id=t.id;
  update public.tarefas set proxima_repeticao=null where id=t.id;
  total:=total+1;
 end loop;
 return total;
end $$;
revoke all on all functions in schema fsj_internal from public,anon,authenticated;
create extension if not exists pg_cron;
select cron.schedule('fsj-tarefas-periodicas','* * * * *','select fsj_internal.gerar_ocorrencias()');
notify pgrst,'reload schema';
