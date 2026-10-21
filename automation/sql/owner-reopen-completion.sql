CREATE TABLE public.conclusoes_revisoes (
 id uuid PRIMARY KEY,
 tarefa_id text NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
 dia_previsto date,
 motivo text NOT NULL CHECK(char_length(btrim(motivo)) BETWEEN 1 AND 1000),
 proprietario_id text NOT NULL REFERENCES public.pessoas(id),
 criado_em timestamptz NOT NULL DEFAULT now(),
 conclusao_id uuid,
 estado_anterior text NOT NULL,
 execucoes_anteriores jsonb NOT NULL DEFAULT '[]',
 retornos_anteriores jsonb NOT NULL DEFAULT '[]'
);
ALTER TABLE public.conclusoes_revisoes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.conclusoes_revisoes FROM anon,authenticated;
GRANT ALL ON public.conclusoes_revisoes TO service_role;
GRANT SELECT ON public.conclusoes_revisoes TO authenticated;
CREATE POLICY proprietario_le_revisoes ON public.conclusoes_revisoes FOR SELECT TO authenticated
 USING ((SELECT auth.uid())=(SELECT o.auth_user_id FROM public.fsj_titularidade o WHERE o.id=true));
CREATE INDEX conclusoes_revisoes_tarefa_data ON public.conclusoes_revisoes(tarefa_id,criado_em DESC);
ALTER TABLE public.retornos ADD COLUMN cancelado_por_revisao uuid REFERENCES public.conclusoes_revisoes(id);
ALTER TABLE public.tarefas ADD COLUMN reaberta_em timestamptz,
 ADD COLUMN reaberta_dia date, ADD COLUMN reabertura_motivo text;

CREATE OR REPLACE FUNCTION public.fsj_info_conclusao(p_tarefa text,p_auth uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path='' AS $$
DECLARE t public.tarefas; choices jsonb; history jsonb;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.fsj_titularidade o JOIN public.pessoas p ON p.id=o.pessoa_id AND p.ativo WHERE o.id=true AND o.auth_user_id=p_auth)
 THEN RAISE EXCEPTION 'Ação exclusiva do Proprietário';END IF;
 SELECT * INTO t FROM public.tarefas WHERE id=p_tarefa;
 IF t.id IS NULL THEN RAISE EXCEPTION 'Demanda indisponível';END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('id',r.id,'dia',r.dia_previsto,'registrada_em',r.criado_em) ORDER BY r.dia_previsto DESC),'[]')
 INTO choices FROM (
  SELECT DISTINCT ON (CASE WHEN t.diaria THEN r.dia_previsto ELSE NULL END) r.id,r.dia_previsto,r.criado_em
  FROM public.retornos r WHERE r.tarefa_id=t.id AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL
  ORDER BY (CASE WHEN t.diaria THEN r.dia_previsto ELSE NULL END),r.criado_em DESC,r.id DESC
 ) r;
 IF NOT t.diaria AND t.situacao='Concluída' AND choices='[]'::jsonb THEN
  choices=jsonb_build_array(jsonb_build_object('id',null,'dia',null,'registrada_em',t.concluida_em));
 END IF;
 SELECT coalesce(jsonb_agg(jsonb_build_object('dia',r.dia_previsto,'motivo',r.motivo,'em',r.criado_em) ORDER BY r.criado_em DESC),'[]')
 INTO history FROM public.conclusoes_revisoes r WHERE r.tarefa_id=t.id;
 RETURN jsonb_build_object('diaria',t.diaria,'situacao',t.situacao,'conclusoes',choices,'revisoes',history);
END $$;
REVOKE ALL ON FUNCTION public.fsj_info_conclusao(text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fsj_info_conclusao(text,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fsj_cancelar_conclusao(
 p_tarefa text,p_auth uuid,p_motivo text,p_requisicao uuid,p_conclusao uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE t public.tarefas; owner_id text; d date; last_id uuid; revision public.conclusoes_revisoes; old_executions jsonb; old_answers jsonb;
BEGIN
 SELECT o.pessoa_id INTO owner_id FROM public.fsj_titularidade o JOIN public.pessoas p ON p.id=o.pessoa_id AND p.ativo WHERE o.id=true AND o.auth_user_id=p_auth;
 IF owner_id IS NULL THEN RAISE EXCEPTION 'Ação exclusiva do Proprietário';END IF;
 p_motivo=btrim(coalesce(p_motivo,''));
 IF char_length(p_motivo) NOT BETWEEN 1 AND 1000 OR p_requisicao IS NULL THEN RAISE EXCEPTION 'Informe o motivo, com até 1000 caracteres';END IF;
 -- Same ordering as response/start: links before task avoids locking inversion.
 PERFORM l.token FROM public.links_resposta l WHERE l.tarefa_id=p_tarefa ORDER BY l.token FOR UPDATE;
 SELECT * INTO t FROM public.tarefas WHERE id=p_tarefa FOR UPDATE;
 IF t.id IS NULL THEN RAISE EXCEPTION 'Demanda indisponível';END IF;
 SELECT * INTO revision FROM public.conclusoes_revisoes WHERE id=p_requisicao;
 IF FOUND THEN
  IF revision.tarefa_id<>p_tarefa OR revision.proprietario_id<>owner_id OR revision.conclusao_id IS DISTINCT FROM p_conclusao
  THEN RAISE EXCEPTION 'Identificador de revisão inválido';END IF;
  RETURN jsonb_build_object('ok',true,'id',revision.id,'dia',revision.dia_previsto,'situacao','Pendente','repetida',true);
 END IF;
 IF t.situacao='Arquivado' THEN RAISE EXCEPTION 'Demanda arquivada: a conclusão não pode ser cancelada nesta edição';END IF;
 IF p_conclusao IS NOT NULL THEN
  SELECT r.dia_previsto INTO d FROM public.retornos r WHERE r.id=p_conclusao AND r.tarefa_id=t.id AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'A conclusão mudou. Atualize a demanda antes de revisar';END IF;
  SELECT r.id INTO last_id FROM public.retornos r WHERE r.tarefa_id=t.id AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL AND (NOT t.diaria OR r.dia_previsto=d)
   ORDER BY r.criado_em DESC,r.id DESC LIMIT 1;
  IF last_id<>p_conclusao THEN RAISE EXCEPTION 'A conclusão mudou. Atualize a demanda antes de revisar';END IF;
 ELSE
  IF t.diaria OR t.situacao<>'Concluída' OR EXISTS(SELECT 1 FROM public.retornos r WHERE r.tarefa_id=t.id AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL)
  THEN RAISE EXCEPTION 'Não há conclusão válida para cancelar';END IF;
 END IF;
 IF NOT t.diaria THEN d=NULL;END IF;
 SELECT coalesce(jsonb_agg(to_jsonb(e)),'[]') INTO old_executions FROM public.execucoes_tarefa e WHERE e.tarefa_id=t.id AND (NOT t.diaria OR e.dia=d);
 SELECT coalesce(jsonb_agg(to_jsonb(r)),'[]') INTO old_answers FROM public.retornos r WHERE r.tarefa_id=t.id AND r.cancelado_por_revisao IS NULL AND (NOT t.diaria OR r.dia_previsto=d);
 INSERT INTO public.conclusoes_revisoes(id,tarefa_id,dia_previsto,motivo,proprietario_id,conclusao_id,estado_anterior,execucoes_anteriores,retornos_anteriores)
 VALUES(p_requisicao,t.id,d,p_motivo,owner_id,p_conclusao,t.situacao,old_executions,old_answers);
 -- Retain every old response and attachment; exclude this occurrence's old answers from new decisions.
 -- Legacy clients/automation test tipo=sim: a rejected completion must not validate there either.
 UPDATE public.retornos SET cancelado_por_revisao=p_requisicao,tipo=CASE WHEN tipo='sim' THEN 'sim_cancelado' ELSE tipo END
 WHERE tarefa_id=t.id AND cancelado_por_revisao IS NULL AND (NOT t.diaria OR dia_previsto=d);
 UPDATE public.links_resposta SET respondido_em=NULL WHERE tarefa_id=t.id AND (NOT t.diaria OR dia=d);
 UPDATE public.execucoes_tarefa SET estado='suspensa',suspenso_em=now(),concluido_em=NULL
 WHERE tarefa_id=t.id AND (NOT t.diaria OR dia=d);
 UPDATE public.tarefas SET situacao='Pendente',concluida_em=NULL,concluida_por=NULL,
 reaberta_em=now(),reaberta_dia=d,reabertura_motivo=p_motivo,atualizada_em=now() WHERE id=t.id;
 RETURN jsonb_build_object('ok',true,'id',p_requisicao,'dia',d,'situacao','Pendente');
END $$;
REVOKE ALL ON FUNCTION public.fsj_cancelar_conclusao(text,uuid,text,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fsj_cancelar_conclusao(text,uuid,text,uuid,uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.fsj_iniciar_tarefa(p_token uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare l public.links_resposta;t public.tarefas;r public.execucoes_tarefa;old public.execucoes_tarefa;paused jsonb='[]';was_started boolean;
begin
 select * into l from public.links_resposta where token=p_token for update;
 if l.token is null or not public.fsj_link_resposta_vigente(p_token) then raise exception 'Link expirado ou invalido';end if;
 if not exists(select 1 from public.pessoas where id=l.pessoa_id and ativo) or not exists(select 1 from public.tarefa_responsaveis where tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id) then raise exception 'Tarefa indisponivel';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('execucao|'||l.pessoa_id,0));
 select * into t from public.tarefas where id=l.tarefa_id FOR UPDATE; IF t.situacao='Arquivado' THEN RAISE EXCEPTION 'Tarefa arquivada';END IF;
 if l.respondido_em is not null or (not t.diaria and t.situacao='Concluída') or exists(select 1 from public.retornos where cancelado_por_revisao IS NULL and tarefa_id=l.tarefa_id and tipo='sim' and (not t.diaria or dia_previsto=l.dia)) then raise exception 'Tarefa ja concluida ou respondida';end if;
 select * into r from public.execucoes_tarefa where pessoa_id=l.pessoa_id and tarefa_id=l.tarefa_id and dia=l.dia;
 if r.estado='em_andamento' then return jsonb_build_object('execucao',to_jsonb(r),'suspensas',paused);end if;
 if r.estado='concluida' then raise exception 'Tarefa ja concluida';end if;
 was_started=r.pessoa_id is not null;
 for old in select * from public.execucoes_tarefa where pessoa_id=l.pessoa_id and estado='em_andamento' for update loop
  update public.execucoes_tarefa set estado='suspensa',suspenso_em=now() where pessoa_id=old.pessoa_id and tarefa_id=old.tarefa_id and dia=old.dia;
  insert into public.execucoes_historico(pessoa_id,tarefa_id,dia,acao) values(old.pessoa_id,old.tarefa_id,old.dia,'suspender');
  paused=paused||jsonb_build_array(jsonb_build_object('tarefa_id',old.tarefa_id,'tarefa',(select descricao from public.tarefas where id=old.tarefa_id),'suspenso_em',now()));
 end loop;
 insert into public.execucoes_tarefa(pessoa_id,tarefa_id,dia,estado) values(l.pessoa_id,l.tarefa_id,l.dia,'em_andamento')
 on conflict(pessoa_id,tarefa_id,dia) do update set estado='em_andamento',retomado_em=now() returning * into r;
 insert into public.execucoes_historico(pessoa_id,tarefa_id,dia,acao) values(l.pessoa_id,l.tarefa_id,l.dia,case when was_started then 'retomar' else 'iniciar' end);
 return jsonb_build_object('execucao',to_jsonb(r),'suspensas',paused);
end $function$
;

CREATE OR REPLACE FUNCTION public.fsj_registrar_resposta(p_token uuid, p_resposta text, p_justificativa text, p_itens_faltantes text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare l public.links_resposta; rid uuid; owner_id text; task_id text; task_name text; employee text; content text;
begin

 p_justificativa=btrim(coalesce(p_justificativa,''));p_itens_faltantes=btrim(coalesce(p_itens_faltantes,''));
 if p_resposta not in ('sim','nao') or p_resposta is null or char_length(p_justificativa)>2000 or char_length(p_itens_faltantes)>2000 or (p_resposta='nao' and p_justificativa='') or (p_resposta='sim' and p_itens_faltantes<>'') then raise exception 'Resposta invalida' using errcode='22023';end if;
 select * into l from public.links_resposta where token=p_token for update;
 if l.token is null or not public.fsj_link_resposta_vigente(p_token) then raise exception 'Link expirado ou invalido' using errcode='22023';end if;
 if not public.fsj_horario_resposta(clock_timestamp()) and not (p_resposta='sim' and exists(select 1 from public.tarefas td where td.id=l.tarefa_id and (td.periodicidade='diaria' or td.diaria))) and not (l.tarefa_id='mul7qq1cyxqr' and l.pessoa_id='mul7f1dr2zki') and not exists(select 1 from public.fsj_titularidade where id=true and pessoa_id=l.pessoa_id) then raise exception 'FSJ_FORA_EXPEDIENTE' using errcode='P0001';end if;
 if not exists(select 1 from public.pessoas where id=l.pessoa_id and ativo) or not exists(select 1 from public.tarefa_responsaveis where tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id) then raise exception 'Tarefa indisponivel' using errcode='22023';end if;
 -- Serializes different tokens for the same person/task as well as retries of this token.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(l.tarefa_id||'|'||l.pessoa_id||'|'||l.dia::text,0));
 if l.respondido_em is not null or exists(select 1 from public.retornos where cancelado_por_revisao IS NULL and tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id and dia_previsto=l.dia) then raise exception 'Esta tarefa ja recebeu resposta' using errcode='23505';end if;
 PERFORM 1 FROM public.tarefas WHERE id=l.tarefa_id FOR UPDATE; IF EXISTS(SELECT 1 FROM public.tarefas WHERE id=l.tarefa_id AND situacao='Arquivado') THEN RAISE EXCEPTION 'Tarefa arquivada';END IF; select descricao into task_name from public.tarefas where id=l.tarefa_id;
 select coalesce(nullif(identificacao,''),nome) into employee from public.pessoas where id=l.pessoa_id;
 content=p_justificativa;
 if p_itens_faltantes<>'' then
  select pessoa_id into owner_id from public.fsj_titularidade where id=true;
  if owner_id is null then raise exception 'Proprietario nao configurado';end if;
  task_id='itens-'||pg_catalog.gen_random_uuid()::text;
  insert into public.tarefas(id,descricao,diaria,situacao) values(task_id,'Providenciar itens faltantes: '||p_itens_faltantes||E'\nSolicitante: '||employee||E'\nTarefa de origem: '||task_name||E'\nJustificativa: '||p_justificativa,false,'Em aberto');
  insert into public.tarefa_responsaveis(tarefa_id,pessoa_id) values(task_id,owner_id);
  content=content||E'\nItens Faltantes: '||p_itens_faltantes||E'\nDemanda encaminhada ao Proprietário.';
 end if;
 insert into public.retornos(tarefa_id,pessoa_id,dia_previsto,origem,tipo,conteudo,itens_faltantes,tarefa_proprietario_id) values(l.tarefa_id,l.pessoa_id,l.dia,'formulario',p_resposta,content,p_itens_faltantes,task_id) returning id into rid;
 update public.links_resposta set respondido_em=now() where token=p_token;
 return jsonb_build_object('id',rid,'tarefa_proprietario_id',task_id);
end $function$
;

CREATE OR REPLACE FUNCTION public.fsj_aprovar_arquivamento(p_tarefa text, p_token uuid DEFAULT NULL::uuid, p_auth uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE t public.tarefas; aprovador text; perfil text;
BEGIN
 IF p_auth IS NOT NULL THEN
  SELECT o.pessoa_id INTO aprovador FROM public.fsj_titularidade o JOIN public.pessoas p ON p.id=o.pessoa_id AND p.ativo WHERE o.auth_user_id=p_auth;
  perfil='proprietario';
 ELSE
  SELECT b.pessoa_id INTO aprovador FROM public.quadros_do_dia b JOIN public.pessoas p ON p.id=b.pessoa_id AND p.ativo JOIN public.supervisores_fsj s ON s.pessoa_id=p.id AND s.ativo
  WHERE b.token=p_token AND b.expira_em>now() AND b.dia=(now() AT TIME ZONE 'America/Recife')::date;
  perfil='supervisor';
 END IF;
 IF aprovador IS NULL THEN RAISE EXCEPTION 'Aprovação não autorizada'; END IF;
 SELECT * INTO t FROM public.tarefas WHERE id=p_tarefa FOR UPDATE;
 IF t.id IS NULL THEN RAISE EXCEPTION 'Tarefa indisponível';END IF;
 IF perfil='supervisor' AND (
  NOT EXISTS(SELECT 1 FROM public.tarefa_responsaveis r WHERE r.tarefa_id=t.id)
  OR EXISTS(SELECT 1 FROM public.tarefa_responsaveis r WHERE r.tarefa_id=t.id AND r.pessoa_id NOT IN(SELECT public.fsj_supervisionados(aprovador)))
 ) THEN RAISE EXCEPTION 'Tarefa fora da supervisão autorizada';END IF;
 IF t.situacao='Arquivado' THEN RETURN jsonb_build_object('ok',true,'situacao','Arquivado');END IF;
 IF t.situacao<>'Concluída' AND NOT EXISTS(SELECT 1 FROM public.retornos r WHERE r.tarefa_id=t.id AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL AND (NOT t.diaria OR r.dia_previsto=(now() AT TIME ZONE 'America/Recife')::date))
 THEN RAISE EXCEPTION 'A tarefa precisa estar concluída antes da aprovação';END IF;
 IF EXISTS(SELECT 1 FROM public.execucoes_tarefa e WHERE e.tarefa_id=t.id AND e.estado='em_andamento') THEN RAISE EXCEPTION 'Há execução em andamento';END IF;
 INSERT INTO public.tarefas_arquivamentos(tarefa_id,aprovado_por,situacao_anterior,perfil) VALUES(t.id,aprovador,t.situacao,perfil);
 UPDATE public.tarefas SET situacao='Arquivado',atualizada_em=now() WHERE id=t.id;
 RETURN jsonb_build_object('ok',true,'situacao','Arquivado');
END $function$
;

CREATE OR REPLACE FUNCTION public.fsj_progresso_diario(p_tarefas text[], p_mes date DEFAULT NULL::date, p_pessoa text DEFAULT NULL::text, p_escopo text[] DEFAULT NULL::text[])
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
 WITH params AS (
 SELECT date_trunc('month',coalesce(p_mes,(now() AT TIME ZONE 'America/Recife')::date)::timestamp)::date inicio
 ), ts AS (
 SELECT t.* FROM public.tarefas t WHERE t.id=ANY(p_tarefas)
 AND (t.periodicidade='diaria' OR t.diaria)
 AND (p_pessoa IS NULL OR EXISTS(SELECT 1 FROM public.tarefa_responsaveis a WHERE a.tarefa_id=t.id AND a.pessoa_id=p_pessoa))
 ), dias AS (
 SELECT t.id, d.dia::date dia FROM ts t CROSS JOIN params
 CROSS JOIN LATERAL generate_series(params.inicio::timestamp,(params.inicio+interval '1 month - 1 day')::timestamp,interval '1 day') d(dia)
 WHERE d.dia::date >= (t.criada_em AT TIME ZONE 'America/Recife')::date
 AND NOT EXISTS(SELECT 1 FROM public.tarefas_arquivamentos ar WHERE ar.tarefa_id=t.id AND d.dia::date>(ar.aprovado_em AT TIME ZONE 'America/Recife')::date)
 AND EXISTS(
 SELECT 1 FROM public.tarefa_responsaveis a JOIN public.pessoas p ON p.id=a.pessoa_id
 WHERE a.tarefa_id=t.id AND (p_pessoa IS NULL OR p.id=p_pessoa)
 AND (p_escopo IS NULL OR p.id=ANY(p_escopo))
 AND d.dia::date >= (p.criado_em AT TIME ZONE 'America/Recife')::date
 AND NOT(d.dia::date=ANY(coalesce(p.folgas_datas,'{}'::date[])))
 AND (p.ferias_inicio IS NULL OR NOT(d.dia::date BETWEEN p.ferias_inicio AND coalesce(p.ferias_fim,p.ferias_inicio)))
 AND NOT EXISTS(SELECT 1 FROM public.folgas_semana f WHERE f.pessoa_id=p.id AND f.dia=d.dia::date)
 AND NOT (
 extract(dow FROM d.dia)::smallint=ANY(coalesce(p.folgas_semanais,'{}'::smallint[]))
 AND NOT EXISTS(SELECT 1 FROM public.folgas_semana f WHERE f.pessoa_id=p.id AND f.semana=date_trunc('week',d.dia)::date AND f.dia IS NOT NULL))
 AND NOT EXISTS(SELECT 1 FROM public.feriados_envio c WHERE c.pessoa_id=p.id AND c.folga_compensatoria=d.dia::date)
 AND (NOT EXISTS(SELECT 1 FROM public.feriados_fsj h WHERE h.dia=d.dia::date)
 OR EXISTS(SELECT 1 FROM public.feriados_envio e WHERE e.pessoa_id=p.id AND e.dia=d.dia::date AND e.receber))
 )
 ), counts AS (
 SELECT t.id,count(d.dia)::int y,count(d.dia) FILTER(WHERE EXISTS(
 SELECT 1 FROM public.retornos r WHERE r.tarefa_id=t.id AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL AND r.dia_previsto=d.dia
 AND (p_escopo IS NULL OR r.pessoa_id=ANY(p_escopo))
 AND r.criado_em >= (d.dia::timestamp AT TIME ZONE 'America/Recife')
 AND r.criado_em < ((d.dia+2)::timestamp AT TIME ZONE 'America/Recife')
 ))::int x FROM ts t LEFT JOIN dias d ON d.id=t.id GROUP BY t.id
 )
 SELECT coalesce(jsonb_object_agg(c.id,jsonb_build_object(
 'mes',to_char(params.inicio,'YYYY-MM'),'em_tempo',c.x,'previstos',c.y,'rotulo',c.x||' / '||c.y,
 'prazo','Até 23h59 do dia seguinte ao previsto (Recife)')),'{}'::jsonb)
 FROM counts c CROSS JOIN params;
$function$
;

CREATE OR REPLACE FUNCTION public.fsj_supervisor_demandas(p_token uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
declare pid text; name text; today date=(now() at time zone 'America/Recife')::date; result jsonb;
begin
 select p.id,coalesce(nullif(p.identificacao,''),p.nome) into pid,name
 from public.quadros_do_dia b join public.pessoas p on p.id=b.pessoa_id join public.supervisores_fsj s on s.pessoa_id=p.id
 where b.token=p_token and p.ativo and s.ativo and b.dia=today and b.expira_em>now();
 if pid is null then raise exception 'Acesso de supervisao indisponivel ou link expirado' using errcode='P0001';end if;
 with allowed as materialized(select public.fsj_supervisionados(pid) id),
 groups as materialized(select g.id,g.nome from public.grupos g join public.supervisores_grupos a on a.grupo_id=g.id where a.supervisor_id=pid),
 tasks as materialized(select t.* from public.tarefas t where t.grupo_id in(select id from groups) or exists(select 1 from public.tarefa_responsaveis a where a.tarefa_id=t.id and a.pessoa_id in(select id from allowed)))
 select jsonb_build_object(
  'supervisor',name,'dia',today,'atualizado_em',now(),
  'pessoas',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'nome',coalesce(nullif(p.identificacao,''),p.nome)) order by p.nome) from public.pessoas p where p.id in(select id from allowed)),'[]'::jsonb),
  'grupos',coalesce((select jsonb_agg(to_jsonb(g) order by g.nome) from groups g),'[]'::jsonb),
  'tarefas',coalesce((select jsonb_agg(jsonb_build_object(
   'id',t.id,'descricao',t.descricao,'diaria',t.diaria,'reabertura_motivo',t.reabertura_motivo,'reaberta_dia',t.reaberta_dia,
   'situacao',case when t.situacao='Arquivado' then 'Arquivado' when exists(select 1 from public.retornos r where r.cancelado_por_revisao IS NULL and r.tarefa_id=t.id and r.tipo='sim' and (not t.diaria or r.dia_previsto=today)) or (not t.diaria and t.situacao='Concluída') then 'Concluída'
    when answer.tipo='nao' then 'Pendente' when answer.tipo='pergunta' then 'Aguardando gestão' when t.diaria and t.reaberta_dia=today then 'Pendente' when t.diaria then 'Em aberto' else t.situacao end,
   'responsaveis',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'nome',coalesce(nullif(p.identificacao,''),p.nome)) order by p.nome) from public.tarefa_responsaveis a join public.pessoas p on p.id=a.pessoa_id where a.tarefa_id=t.id and p.id in(select id from allowed)),'[]'::jsonb),
   'grupos',coalesce((select jsonb_agg(g.id) from groups g where g.id=t.grupo_id or exists(select 1 from public.tarefa_responsaveis a join public.grupo_membros m on m.pessoa_id=a.pessoa_id where a.tarefa_id=t.id and m.grupo_id=g.id)),'[]'::jsonb),
   'execucoes',coalesce((select jsonb_agg(jsonb_build_object('responsavel',coalesce(nullif(p.identificacao,''),p.nome),'estado',e.estado,'iniciado_em',e.iniciado_em,'retomado_em',e.retomado_em,'suspenso_em',e.suspenso_em,'concluido_em',e.concluido_em) order by e.iniciado_em) from public.execucoes_tarefa e join public.pessoas p on p.id=e.pessoa_id where e.tarefa_id=t.id and e.dia=today and e.pessoa_id in(select id from allowed)),'[]'::jsonb),
   'resposta',case when answer.id is null then null else jsonb_build_object('tipo',answer.tipo,'conteudo',answer.conteudo,'criado_em',answer.criado_em,'responsavel',coalesce(nullif(answer.identificacao,''),answer.nome)) end
  ) order by t.criada_em desc,t.id) from tasks t left join lateral (
    select r.*,p.nome,p.identificacao from public.retornos r join public.pessoas p on p.id=r.pessoa_id
    where r.cancelado_por_revisao IS NULL and r.tarefa_id=t.id and r.pessoa_id in(select id from allowed) and (not t.diaria or r.dia_previsto=today)
    order by r.criado_em desc,r.id desc limit 1
   )answer on true),'[]'::jsonb)
 ) into result;
 return result;
end $function$
;

