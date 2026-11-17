CREATE FUNCTION public.fsj_dias_dispensa_tarefa(p_pessoa text,p_inicio date,p_fim date)
RETURNS TABLE(dia date,motivo text,tipo text)
LANGUAGE sql STABLE
SET search_path TO ''
AS $$
 SELECT d.dia, regra.motivo, regra.tipo
 FROM public.pessoas p
 CROSS JOIN LATERAL (
  SELECT p_inicio+g.n AS dia FROM pg_catalog.generate_series(0,p_fim-p_inicio) g(n)
  WHERE p_fim-p_inicio BETWEEN 0 AND 370
 ) d
 CROSS JOIN LATERAL (
  SELECT (d.dia=ANY(coalesce(p.folgas_datas,'{}'::date[]))) AS manual,
    coalesce(nullif(p.folgas_motivos->>d.dia::text,''),'Folga registrada') AS motivo_manual,
    (SELECT pg_catalog.string_agg(h.nome,', ' ORDER BY h.nome) FROM public.feriados_fsj h WHERE h.dia=d.dia) AS feriado,
    (EXISTS(SELECT 1 FROM public.feriados_envio e WHERE e.pessoa_id=p.id AND e.dia=d.dia AND e.receber=true)
     OR EXISTS(SELECT 1 FROM pg_catalog.jsonb_each_text(coalesce(p.folgas_motivos,'{}'::jsonb)) f
               WHERE f.key=ANY(ARRAY(SELECT marcado::text FROM unnest(p.folgas_datas) marcado))
                 AND f.value ~* 'folga compensat[oó]ria' AND f.value ILIKE '%feriado compensado: '||d.dia::text||'%')) AS trabalho_feriado,
    EXISTS(SELECT 1 FROM public.feriados_envio e WHERE e.pessoa_id=p.id AND e.folga_compensatoria=d.dia) AS compensatoria,
    (EXISTS(SELECT 1 FROM public.folgas_semana f WHERE f.pessoa_id=p.id AND f.dia=d.dia)
     OR (extract(dow FROM d.dia)::smallint=ANY(coalesce(p.folgas_semanais,'{}'::smallint[]))
      AND NOT EXISTS(SELECT 1 FROM public.folgas_semana f WHERE f.pessoa_id=p.id AND f.semana=pg_catalog.date_trunc('week',d.dia::timestamp)::date AND f.dia IS NOT NULL))) AS semanal
 ) fonte
 CROSS JOIN LATERAL (
  SELECT motivo,tipo FROM (VALUES
   (1,p.ferias_inicio IS NOT NULL AND d.dia BETWEEN p.ferias_inicio AND coalesce(p.ferias_fim,p.ferias_inicio),'Férias','vacation'),
   (2,fonte.compensatoria,'Folga compensatória','leave'),
   (3,fonte.manual AND NOT(fonte.trabalho_feriado AND fonte.motivo_manual ~* '^feriado'),
       fonte.motivo_manual,CASE WHEN fonte.motivo_manual ~* '^feriado' THEN 'holiday' WHEN fonte.motivo_manual ~* 'f[eé]rias' THEN 'vacation' ELSE 'leave' END),
   (4,fonte.feriado IS NOT NULL AND NOT fonte.trabalho_feriado,'Feriado — '||fonte.feriado,'holiday'),
   (5,fonte.semanal,'Folga semanal','leave')
  ) op(ordem,vale,motivo,tipo) WHERE vale ORDER BY ordem LIMIT 1
 ) regra
 WHERE p.id=p_pessoa
 ORDER BY d.dia;
$$;

REVOKE ALL ON FUNCTION public.fsj_dias_dispensa_tarefa(text,date,date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fsj_dias_dispensa_tarefa(text,date,date) TO service_role;

CREATE OR REPLACE FUNCTION public.fsj_concluir_calendario_periodico(p_tarefa text, p_pessoa text, p_dia date, p_proprietario boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
 tarefa public.tarefas;
 registro public.retornos;
 hoje date := (pg_catalog.now() AT TIME ZONE 'America/Recife')::date;
 inicio date;
 fim date;
 dia_registro date;
 diaria boolean;
 atraso boolean;
BEGIN
 SELECT * INTO tarefa FROM public.tarefas WHERE id=p_tarefa FOR UPDATE;
 IF NOT FOUND OR tarefa.situacao IN ('Arquivado','Arquivada','Cancelada')
  OR tarefa.periodicidade NOT IN ('diaria','semanal','quinzenal','mensal','trimestral','semestral','anual') THEN
  RAISE EXCEPTION 'Tarefa periódica indisponível' USING ERRCODE='42501';
 END IF;
 diaria := tarefa.periodicidade='diaria';
 IF NOT EXISTS(SELECT 1 FROM public.pessoas WHERE id=p_pessoa AND ativo)
  OR NOT (EXISTS(SELECT 1 FROM public.tarefa_responsaveis WHERE tarefa_id=p_tarefa AND pessoa_id=p_pessoa)
      OR (p_proprietario AND EXISTS(SELECT 1 FROM public.grupo_membros WHERE grupo_id=tarefa.grupo_id AND pessoa_id=p_pessoa))) THEN
  RAISE EXCEPTION 'Responsável não vinculado à tarefa' USING ERRCODE='42501';
 END IF;
 inicio := (tarefa.criada_em AT TIME ZONE 'America/Recife')::date;
 fim := CASE WHEN diaria THEN p_dia ELSE inicio+CASE tarefa.periodicidade
  WHEN 'semanal' THEN 7 WHEN 'quinzenal' THEN 14 WHEN 'mensal' THEN 30
  WHEN 'trimestral' THEN 90 WHEN 'semestral' THEN 180 WHEN 'anual' THEN 365 END END;
 IF p_dia IS NULL OR p_dia<inicio OR p_dia>hoje OR p_dia>fim THEN
  RAISE EXCEPTION 'Dia fora da vigência da tarefa' USING ERRCODE='22023';
 END IF;
 atraso := CASE WHEN diaria THEN hoje>p_dia+1 ELSE hoje>fim END;
 SELECT * INTO registro FROM public.retornos r
 WHERE r.tarefa_id=p_tarefa AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL
  AND (CASE WHEN diaria THEN (tarefa.grupo_id IS NOT NULL OR r.pessoa_id=p_pessoa)
    AND coalesce(r.dia_previsto,(r.criado_em AT TIME ZONE 'America/Recife')::date)=p_dia
   ELSE coalesce(r.dia_previsto,(r.criado_em AT TIME ZONE 'America/Recife')::date) BETWEEN inicio AND fim END)
 ORDER BY r.criado_em,r.id LIMIT 1;
 IF FOUND THEN
  RETURN pg_catalog.jsonb_build_object('ok',true,'ja_concluida',true,'atrasada',atraso,'dia',registro.dia_previsto);
 END IF;
 IF EXISTS(SELECT 1 FROM public.fsj_dias_dispensa_tarefa(p_pessoa,p_dia,p_dia)) THEN
  RAISE EXCEPTION 'Dia dispensado no calendário de folgas e feriados da pessoa' USING ERRCODE='42501';
 END IF;
 IF atraso AND NOT coalesce(p_proprietario,false) THEN
  RAISE EXCEPTION 'Prazo encerrado. Somente o Proprietário pode regularizar' USING ERRCODE='42501';
 END IF;
 dia_registro := CASE WHEN diaria THEN p_dia ELSE least(hoje,fim) END;
 INSERT INTO public.retornos(tarefa_id,pessoa_id,dia_previsto,origem,tipo,conteudo)
 VALUES(p_tarefa,p_pessoa,dia_registro,
  CASE WHEN p_proprietario THEN 'regularizacao_proprietario' ELSE 'calendario_executor' END,
  'sim','Conclusão registrada pelo calendário periódico.')
 RETURNING * INTO registro;
 RETURN pg_catalog.jsonb_build_object('ok',true,'atrasada',atraso,'dia',registro.dia_previsto,
  'registro',pg_catalog.jsonb_build_object('id',registro.id,'dia_previsto',registro.dia_previsto));
END
$function$;
