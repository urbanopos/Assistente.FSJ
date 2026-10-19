ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS exigir_folga_semanal boolean NOT NULL DEFAULT true;
COMMENT ON COLUMN public.pessoas.exigir_folga_semanal IS 'Escolha semanal obrigatoria; gestor pode dispensar visitantes sem alterar demais acessos.';
CREATE OR REPLACE FUNCTION public.fsj_preparar_calendario(p_dia date)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare y int; a int;b int;c int;d int;e int;f int;g int;h int;i int;k int;l int;m int;pascoa date;
begin
 insert into public.folgas_semana(pessoa_id,semana)
 select id,date_trunc('week',p_dia::timestamp)::date from public.pessoas where ativo and receber_tarefas_whatsapp and exigir_folga_semanal
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
end $function$
;
CREATE OR REPLACE FUNCTION public.fsj_escolher_folga(p_token uuid, p_dia date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
 if exists(select 1 from public.pessoas p where p.id=pid and p.exigir_folga_semanal=false) then
  if p_dia is not null then raise exception 'Escolha de folga dispensada pelo gestor' using errcode='P0001'; end if;
  return jsonb_build_object('pessoa_id',pid,'semana',wk,'hoje',today,'fim_semana',wk+6,'dia',null,'exigir_folga_semanal',false);
 end if;
 insert into public.folgas_semana(pessoa_id,semana) values(pid,wk) on conflict do nothing;
 select * into r from public.folgas_semana where pessoa_id=pid and semana=wk for update;
 if p_dia is not null then
  if r.bloqueada_gestor then raise exception 'Folga definida pelo gestor; alteracao bloqueada' using errcode='P0001'; end if;
  if p_dia<today or p_dia not between wk and wk+6 then raise exception 'Escolha uma data restante desta semana' using errcode='P0001'; end if;
  insert into public.folgas_historico(pessoa_id,semana,dia_anterior,dia_novo,definido_por) values(pid,wk,r.dia,p_dia,'empregado');
  update public.folgas_semana set dia=p_dia,definido_por='empregado',atualizado_em=now() where pessoa_id=pid and semana=wk returning * into r;
 end if;
 return to_jsonb(r)||jsonb_build_object('hoje',today,'fim_semana',wk+6,'exigir_folga_semanal',true);
end $function$
;
CREATE OR REPLACE FUNCTION public.fsj_exigir_folga_semanal()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare hoje date=(clock_timestamp() at time zone 'America/Recife')::date;
        semana_atual date;
begin
 if TG_TABLE_NAME='retornos' then
  if NEW.tarefa_id is null or NEW.tipo not in ('sim','nao','pergunta') then return NEW; end if;
 end if;
 if exists(select 1 from public.pessoas p where p.id=NEW.pessoa_id and p.exigir_folga_semanal=false) then return NEW; end if;
 semana_atual=date_trunc('week',hoje::timestamp)::date;
 if NEW.pessoa_id is not null and not exists(
  select 1 from public.folgas_semana f where f.pessoa_id=NEW.pessoa_id
  and f.semana=semana_atual and f.dia between semana_atual and semana_atual+6
 ) then
  raise exception 'FOLGA_SEMANAL_PENDENTE: Escolha e confirme pelo menos um dia de folga desta semana antes de registrar tarefas.' using errcode='P0001';
 end if;
 return NEW;
end $function$
;
