-- All employee writes use the server-side bearer board token; no anonymous table access.
create table public.folgas_semana (
 pessoa_id text not null references public.pessoas(id), semana date not null,
 dia date, bloqueada_gestor boolean not null default false,
 definido_por text not null default 'pendente' check(definido_por in ('pendente','empregado','gestor')),
 atualizado_em timestamptz not null default now(),
 primary key(pessoa_id,semana),
 check(extract(isodow from semana)=1), check(dia is null or dia between semana and semana+6)
);
create table public.folgas_historico (
 id bigint generated always as identity primary key, pessoa_id text not null,
 semana date not null, dia_anterior date, dia_novo date, definido_por text not null,
 criado_em timestamptz not null default now()
);
create table public.feriados_fsj (
 dia date primary key, nome text not null, ambito text not null, fonte text not null
);
create table public.feriados_envio (
 pessoa_id text not null references public.pessoas(id), dia date not null,
 receber boolean not null, atualizado_em timestamptz not null default now(),
 primary key(pessoa_id,dia)
);
alter table public.folgas_semana enable row level security;
alter table public.folgas_historico enable row level security;
alter table public.feriados_fsj enable row level security;
alter table public.feriados_envio enable row level security;
revoke all on public.folgas_semana,public.folgas_historico,public.feriados_fsj,public.feriados_envio from anon,authenticated;
grant select on public.folgas_semana,public.folgas_historico,public.feriados_fsj,public.feriados_envio to authenticated;
grant all on public.folgas_semana,public.folgas_historico,public.feriados_fsj,public.feriados_envio to service_role;
grant usage,select on sequence public.folgas_historico_id_seq to service_role;
create policy gestor_le_folgas on public.folgas_semana for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
create policy gestor_le_historico on public.folgas_historico for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
create policy gestor_le_feriados on public.feriados_fsj for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');
create policy gestor_le_decisoes on public.feriados_envio for select to authenticated using ((select auth.jwt()->>'email')='urbanopos@yahoo.com.br');

create function public.fsj_preparar_calendario(p_dia date) returns void language plpgsql security invoker set search_path='' as $$
declare y int; a int;b int;c int;d int;e int;f int;g int;h int;i int;k int;l int;m int;pascoa date;
begin
 insert into public.folgas_semana(pessoa_id,semana)
 select id,date_trunc('week',p_dia::timestamp)::date from public.pessoas where ativo and receber_tarefas_whatsapp
 on conflict do nothing;
 for y in extract(year from p_dia)::int..extract(year from p_dia)::int+1 loop
  a=y%19;b=y/100;c=y%100;d=b/4;e=b%4;f=(b+8)/25;g=(b-f+1)/3;h=(19*a+b-d-g+15)%30;
  i=c/4;k=c%4;l=(32+2*e+2*i-h-k)%7;m=(a+11*h+22*l)/451;
  pascoa=make_date(y,(h+l-7*m+114)/31,(h+l-7*m+114)%31+1);
  insert into public.feriados_fsj(dia,nome,ambito,fonte)
  select make_date(y,mo,dy),nm,scope,src from (values
   (1,1,'Confraternização Universal','Brasil','https://www.planalto.gov.br/ccivil_03/leis/l0662.htm'),
   (4,21,'Tiradentes','Brasil','https://www.planalto.gov.br/ccivil_03/leis/l0662.htm'),
   (5,1,'Dia do Trabalho','Brasil','https://www.planalto.gov.br/ccivil_03/leis/l0662.htm'),
   (9,7,'Independência do Brasil','Brasil','https://www.planalto.gov.br/ccivil_03/leis/l0662.htm'),
   (10,12,'Nossa Senhora Aparecida','Brasil','https://www.planalto.gov.br/ccivil_03/leis/l6802.htm'),
   (11,2,'Finados','Brasil','https://www.planalto.gov.br/ccivil_03/leis/2002/l10607.htm'),
   (11,15,'Proclamação da República','Brasil','https://www.planalto.gov.br/ccivil_03/leis/l0662.htm'),
   (11,20,'Consciência Negra','Brasil','https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14759.htm'),
   (12,25,'Natal','Brasil','https://www.planalto.gov.br/ccivil_03/leis/l0662.htm'),
   (3,6,'Data Magna de Pernambuco','Pernambuco','https://www.detran.pe.gov.br/institucional/informacoes-institucional/feriado-data-magna-2026'),
   (6,24,'São João','Igarassu','https://portal.tjpe.jus.br/servicos/consulta/feriados/feriados-oficiais-nas-comarca-de-pernambuco'),
   (9,27,'Santos Cosme e Damião','Igarassu','https://portal.tjpe.jus.br/servicos/consulta/feriados/feriados-oficiais-nas-comarca-de-pernambuco'),
   (12,8,'Imaculada Conceição','Igarassu','https://portal.tjpe.jus.br/servicos/consulta/feriados/feriados-oficiais-nas-comarca-de-pernambuco')
  )v(mo,dy,nm,scope,src) on conflict do nothing;
  insert into public.feriados_fsj values(pascoa-2,'Sexta-feira da Paixão','Calendário nacional','https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026') on conflict do nothing;
 end loop;
end $$;

create function public.fsj_escolher_folga(p_token uuid,p_dia date default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare pid text; today date=(now() at time zone 'America/Recife')::date; wk date=date_trunc('week',today::timestamp)::date; r public.folgas_semana;
begin
 select b.pessoa_id into pid from public.quadros_do_dia b join public.pessoas p on p.id=b.pessoa_id
 where b.token=p_token and b.expira_em>now() and b.dia=today and p.ativo;
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

create function public.fsj_gestor_folga(p_pessoa text,p_semana date,p_dia date) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.folgas_semana;
begin
 if p_dia is null or p_semana is null or p_dia not between p_semana and p_semana+6 then raise exception 'Data fora da semana';end if;
 insert into public.folgas_semana(pessoa_id,semana) values(p_pessoa,p_semana) on conflict do nothing;
 select * into r from public.folgas_semana where pessoa_id=p_pessoa and semana=p_semana for update;
 insert into public.folgas_historico(pessoa_id,semana,dia_anterior,dia_novo,definido_por) values(p_pessoa,p_semana,r.dia,p_dia,'gestor');
 update public.folgas_semana set dia=p_dia,bloqueada_gestor=true,definido_por='gestor',atualizado_em=now() where pessoa_id=p_pessoa and semana=p_semana returning * into r;
 return to_jsonb(r);
end $$;

create function public.fsj_pode_enviar(p_pessoa text,p_dia date) returns boolean language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.pessoas p where p.id=p_pessoa and p.ativo and p.receber_tarefas_whatsapp
 and not(p_dia=any(p.folgas_datas))
 and not exists(select 1 from public.folgas_semana f where f.pessoa_id=p.id and f.dia=p_dia)
 and (not exists(select 1 from public.feriados_fsj h where h.dia=p_dia)
 or exists(select 1 from public.feriados_envio e where e.pessoa_id=p.id and e.dia=p_dia and e.receber)))
$$;
revoke all on function public.fsj_preparar_calendario(date),public.fsj_escolher_folga(uuid,date),public.fsj_gestor_folga(text,date,date),public.fsj_pode_enviar(text,date) from public,anon,authenticated;
grant execute on function public.fsj_preparar_calendario(date),public.fsj_escolher_folga(uuid,date),public.fsj_gestor_folga(text,date,date),public.fsj_pode_enviar(text,date) to service_role;
select public.fsj_preparar_calendario((now() at time zone 'America/Recife')::date);
