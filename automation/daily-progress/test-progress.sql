
-- Run inside a transaction, after daily-progress.sql and date-attribution.sql.
INSERT INTO public.pessoas(id,nome,ativo,exigir_folga_semanal,criado_em,folgas_semanais,folgas_datas)
VALUES ('__progress_test_person','Teste contagem mensal',true,false,'2026-09-01T03:00:00Z',ARRAY[0]::smallint[],ARRAY['2026-10-02']::date[]);
INSERT INTO public.tarefas(id,descricao,diaria,periodicidade,situacao,criada_em,numero)
OVERRIDING SYSTEM VALUE VALUES ('__progress_test_task','Teste mensal',true,'diaria','Em aberto','2026-10-01T03:00:00Z',-987654);
INSERT INTO public.tarefa_responsaveis(tarefa_id,pessoa_id) VALUES ('__progress_test_task','__progress_test_person');
CREATE TEMP TABLE progress_days AS
 SELECT d::date dia,row_number() OVER(ORDER BY d) n
 FROM generate_series('2026-10-01'::date,'2026-10-31'::date,interval '1 day') d
 WHERE extract(dow FROM d)<>0 AND d::date NOT IN ('2026-10-02','2026-10-12');
INSERT INTO public.retornos(tarefa_id,pessoa_id,origem,tipo,conteudo,dia_previsto,criado_em)
 SELECT '__progress_test_task','__progress_test_person','teste','sim','',dia,
 CASE WHEN n=19 THEN (dia+2)::timestamp AT TIME ZONE 'America/Recife'-interval '1 millisecond'
 ELSE (dia::timestamp+interval '10 hours') AT TIME ZONE 'America/Recife' END
 FROM progress_days WHERE n<=19;
-- Duplicate reports never add a second day; next-day midnight cutoff is excluded.
INSERT INTO public.retornos(tarefa_id,pessoa_id,origem,tipo,conteudo,dia_previsto,criado_em)
 SELECT '__progress_test_task','__progress_test_person','teste','sim','',dia,
 (dia::timestamp+interval '11 hours') AT TIME ZONE 'America/Recife' FROM progress_days WHERE n=1;
INSERT INTO public.retornos(tarefa_id,pessoa_id,origem,tipo,conteudo,dia_previsto,criado_em)
 SELECT '__progress_test_task','__progress_test_person','teste','sim','',dia,
 (dia+2)::timestamp AT TIME ZONE 'America/Recife' FROM progress_days WHERE n=20;
DO $test$
DECLARE v jsonb;
BEGIN
 v=public.fsj_progresso_diario(ARRAY['__progress_test_task'],'2026-10-01','__progress_test_person')->'__progress_test_task';
 ASSERT v->>'rotulo'='19 / 25',v::text;
 ASSERT public.fsj_progresso_diario(ARRAY['__progress_test_task'],'2026-10-01','__not_assigned')='{}'::jsonb;
 ASSERT NOT has_function_privilege('anon','public.fsj_progresso_diario(text[],date,text,text[])','EXECUTE');
 ASSERT NOT has_function_privilege('authenticated','public.fsj_progresso_diario(text[],date,text,text[])','EXECUTE');
END $test$;
-- Month boundary: November 1 at 23:59 belongs to October 31's occurrence.
INSERT INTO public.retornos(tarefa_id,pessoa_id,origem,tipo,conteudo,dia_previsto,criado_em)
 VALUES('__progress_test_task','__progress_test_person','teste','sim','','2026-10-31','2026-11-01T23:59:59-03:00');
DO $test$
BEGIN
 ASSERT public.fsj_progresso_diario(ARRAY['__progress_test_task'],'2026-10-01')->'__progress_test_task'->>'rotulo'='20 / 25';
 ASSERT public.fsj_progresso_diario(ARRAY['__progress_test_task'],'2026-11-01')->'__progress_test_task'->>'em_tempo'='0';
END $test$;
-- Scoped results cannot include another participant's answers.
DO $test$
BEGIN
 ASSERT public.fsj_progresso_diario(ARRAY['__progress_test_task'],'2026-10-01',null,ARRAY['__outsider'])->'__progress_test_task'->>'rotulo'='0 / 0';
END $test$;
-- Independent task for a real next-day response, without the fixed-date fixtures.
INSERT INTO public.tarefas(id,descricao,diaria,periodicidade,situacao,criada_em,numero)
OVERRIDING SYSTEM VALUE VALUES ('__progress_late_task','Teste resposta no dia seguinte',true,'diaria','Em aberto',now()-interval '3 days',-987655);
INSERT INTO public.tarefa_responsaveis(tarefa_id,pessoa_id) VALUES ('__progress_late_task','__progress_test_person');
-- Existing expired daily link remains usable on the immediately following day only.
INSERT INTO public.links_resposta(token,tarefa_id,pessoa_id,dia,expira_em)
 VALUES ('139e5515-54c7-4d36-885d-70d609180671','__progress_late_task','__progress_test_person',
 (now() AT TIME ZONE 'America/Recife')::date-1,date_trunc('day',now() AT TIME ZONE 'America/Recife') AT TIME ZONE 'America/Recife');
DO $test$
DECLARE rid uuid;d date;
BEGIN
 ASSERT public.fsj_link_resposta_vigente('139e5515-54c7-4d36-885d-70d609180671');
 PERFORM public.fsj_iniciar_tarefa('139e5515-54c7-4d36-885d-70d609180671');
 rid=(public.fsj_registrar_resposta('139e5515-54c7-4d36-885d-70d609180671','sim','','')->>'id')::uuid;
 SELECT dia_previsto INTO d FROM public.retornos WHERE id=rid;
 ASSERT d=(now() AT TIME ZONE 'America/Recife')::date-1;
 ASSERT EXISTS(SELECT 1 FROM public.execucoes_tarefa WHERE tarefa_id='__progress_late_task' AND pessoa_id='__progress_test_person' AND dia=d AND estado='concluida');
 BEGIN
  PERFORM public.fsj_registrar_resposta('139e5515-54c7-4d36-885d-70d609180671','sim','','');
  RAISE EXCEPTION 'Duplicate accepted';
 EXCEPTION WHEN unique_violation THEN NULL;
 END;
 UPDATE public.links_resposta SET dia=d-2 WHERE token='139e5515-54c7-4d36-885d-70d609180671';
 ASSERT NOT public.fsj_link_resposta_vigente('139e5515-54c7-4d36-885d-70d609180671');
END $test$;
SELECT 'PASS: 19/25, deadline, duplicates, calendar, month boundary, scope and late response' tests;

