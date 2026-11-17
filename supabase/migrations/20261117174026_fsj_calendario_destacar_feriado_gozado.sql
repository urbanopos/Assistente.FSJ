CREATE OR REPLACE FUNCTION public.fsj_dias_dispensa_tarefa(p_pessoa text,p_inicio date,p_fim date)
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
   (4,fonte.manual AND NOT(fonte.trabalho_feriado AND fonte.motivo_manual ~* '^feriado'),
       fonte.motivo_manual,CASE WHEN fonte.motivo_manual ~* '^feriado' THEN 'holiday' WHEN fonte.motivo_manual ~* 'f[eé]rias' THEN 'vacation' ELSE 'leave' END),
   (3,fonte.feriado IS NOT NULL AND NOT fonte.trabalho_feriado,'Feriado — '||fonte.feriado,'holiday'),
   (5,fonte.semanal,'Folga semanal','leave')
  ) op(ordem,vale,motivo,tipo) WHERE vale ORDER BY ordem LIMIT 1
 ) regra
 WHERE p.id=p_pessoa
 ORDER BY d.dia;
$$;
