-- Rollback-only integration test. Uses the owner's existing binding, never changes it.
INSERT INTO public.pessoas(id,nome,ativo,exigir_folga_semanal,criado_em)
VALUES('__review_test_person','Teste revisão',true,false,'2020-01-01'),('__review_test_peer','Teste revisão grupo',true,false,'2020-01-01');
INSERT INTO public.tarefas(id,descricao,diaria,periodicidade,situacao,criada_em,numero)
OVERRIDING SYSTEM VALUE VALUES
('__review_once','Teste pontual',false,'pontual','Em aberto',now()-interval '3 days',-887651),
('__review_daily','Teste diária',true,'diaria','Em aberto',now()-interval '3 days',-887652);
INSERT INTO public.tarefa_responsaveis(tarefa_id,pessoa_id)
VALUES('__review_once','__review_test_person'),('__review_once','__review_test_peer'),('__review_daily','__review_test_person');
INSERT INTO public.execucoes_tarefa(pessoa_id,tarefa_id,dia,estado)
VALUES('__review_test_person','__review_once',(now() AT TIME ZONE 'America/Recife')::date,'em_andamento');
INSERT INTO public.retornos(id,tarefa_id,pessoa_id,origem,tipo,conteudo,dia_previsto)
VALUES('13a00001-f504-456a-8d2b-987654321001','__review_once','__review_test_person','teste','sim','Resposta original preservada',(now() AT TIME ZONE 'America/Recife')::date),
('13a00001-f504-456a-8d2b-987654321002','__review_daily','__review_test_person','teste','sim','Diária hoje',(now() AT TIME ZONE 'America/Recife')::date);
INSERT INTO public.links_resposta(token,tarefa_id,pessoa_id,dia,respondido_em,expira_em)
VALUES('13a00001-f504-456a-8d2b-987654321003','__review_once','__review_test_person',(now() AT TIME ZONE 'America/Recife')::date,now(),now()+interval '2 days'),
('13a00001-f504-456a-8d2b-987654321004','__review_once','__review_test_peer',(now() AT TIME ZONE 'America/Recife')::date,now(),now()+interval '2 days'),
('13a00001-f504-456a-8d2b-987654321005','__review_daily','__review_test_person',(now() AT TIME ZONE 'America/Recife')::date,now(),now()+interval '2 days');
INSERT INTO public.feriados_envio(pessoa_id,dia,receber)
VALUES('__review_test_person',(now() AT TIME ZONE 'America/Recife')::date,true) ON CONFLICT DO NOTHING;
DO $test$
DECLARE own uuid; info jsonb; result jsonb; before_count int; after_count int; rid uuid; d date=(now() AT TIME ZONE 'America/Recife')::date;
BEGIN
 SELECT auth_user_id INTO own FROM public.fsj_titularidade WHERE id=true;
 ASSERT own IS NOT NULL;
 BEGIN
  PERFORM public.fsj_cancelar_conclusao('__review_once','13a00001-f504-456a-8d2b-987654321099','Inadequado','13a00001-f504-456a-8d2b-987654321011','13a00001-f504-456a-8d2b-987654321001');
  RAISE EXCEPTION 'Unauthorized cancellation accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Ação exclusiva do Proprietário' THEN RAISE;END IF; END;
 BEGIN
  PERFORM public.fsj_cancelar_conclusao('__review_once',own,'  ','13a00001-f504-456a-8d2b-987654321011','13a00001-f504-456a-8d2b-987654321001');
  RAISE EXCEPTION 'Empty reason accepted';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Informe o motivo, com até 1000 caracteres' THEN RAISE;END IF; END;
 info=public.fsj_info_conclusao('__review_once',own);
 ASSERT jsonb_array_length(info->'conclusoes')=1;
 result=public.fsj_cancelar_conclusao('__review_once',own,'Serviço insatisfatório','13a00001-f504-456a-8d2b-987654321011','13a00001-f504-456a-8d2b-987654321001');
 ASSERT result->>'situacao'='Pendente';
 ASSERT EXISTS(SELECT 1 FROM public.retornos WHERE id='13a00001-f504-456a-8d2b-987654321001' AND tipo='sim_cancelado' AND conteudo='Resposta original preservada' AND cancelado_por_revisao IS NOT NULL);
 ASSERT EXISTS(SELECT 1 FROM public.execucoes_tarefa WHERE tarefa_id='__review_once' AND estado='suspensa' AND concluido_em IS NULL);
 ASSERT NOT EXISTS(SELECT 1 FROM public.links_resposta WHERE tarefa_id='__review_once' AND respondido_em IS NOT NULL);
 ASSERT (SELECT execucoes_anteriores->0->>'estado' FROM public.conclusoes_revisoes WHERE id='13a00001-f504-456a-8d2b-987654321011')='concluida';
 ASSERT (SELECT retornos_anteriores->0->>'tipo' FROM public.conclusoes_revisoes WHERE id='13a00001-f504-456a-8d2b-987654321011')='sim';
 PERFORM public.fsj_cancelar_conclusao('__review_once',own,'Serviço insatisfatório','13a00001-f504-456a-8d2b-987654321011','13a00001-f504-456a-8d2b-987654321001');
 ASSERT (SELECT count(*) FROM public.conclusoes_revisoes WHERE tarefa_id='__review_once')=1;
 -- The canceled SIM cannot authorize archiving or block a fresh start.
 BEGIN
  PERFORM public.fsj_aprovar_arquivamento('__review_once',NULL,own);
  RAISE EXCEPTION 'Canceled completion permitted archive';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'A tarefa precisa estar concluída antes da aprovação' THEN RAISE;END IF;END;
 PERFORM public.fsj_iniciar_tarefa('13a00001-f504-456a-8d2b-987654321003');
 before_count=(public.fsj_progresso_diario(ARRAY['__review_daily'])->'__review_daily'->>'em_tempo')::int;
 ASSERT before_count=1;
 PERFORM public.fsj_cancelar_conclusao('__review_daily',own,'Repetir limpeza','13a00001-f504-456a-8d2b-987654321012','13a00001-f504-456a-8d2b-987654321002');
 after_count=(public.fsj_progresso_diario(ARRAY['__review_daily'])->'__review_daily'->>'em_tempo')::int;
 ASSERT after_count=before_count-1;
 PERFORM public.fsj_iniciar_tarefa('13a00001-f504-456a-8d2b-987654321005');
 rid=(public.fsj_registrar_resposta('13a00001-f504-456a-8d2b-987654321005','sim','','')->>'id')::uuid;
 ASSERT rid IS NOT NULL AND rid<>'13a00001-f504-456a-8d2b-987654321002'::uuid;
 ASSERT (public.fsj_progresso_diario(ARRAY['__review_daily'])->'__review_daily'->>'em_tempo')::int=before_count;
 -- A retried request must not cancel the new completion.
 PERFORM public.fsj_cancelar_conclusao('__review_daily',own,'Repetir limpeza','13a00001-f504-456a-8d2b-987654321012','13a00001-f504-456a-8d2b-987654321002');
 ASSERT EXISTS(SELECT 1 FROM public.retornos WHERE id=rid AND tipo='sim' AND cancelado_por_revisao IS NULL);
 ASSERT NOT has_function_privilege('anon','public.fsj_cancelar_conclusao(text,uuid,text,uuid,uuid)','EXECUTE');
 ASSERT NOT has_function_privilege('authenticated','public.fsj_cancelar_conclusao(text,uuid,text,uuid,uuid)','EXECUTE');
END $test$;
SELECT 'PASS: owner-only, reason, group reset, preserved history, retry, daily metric and new response' result;

