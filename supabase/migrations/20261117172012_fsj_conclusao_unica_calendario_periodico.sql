-- Uma conclusão por dia (diária) ou por tarefa/período (demais frequências).
CREATE FUNCTION public.fsj_concluir_calendario_periodico(
 p_tarefa text, p_pessoa text, p_dia date, p_proprietario boolean DEFAULT false
)
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

REVOKE ALL ON FUNCTION public.fsj_concluir_calendario_periodico(text,text,date,boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fsj_concluir_calendario_periodico(text,text,date,boolean) TO service_role;

CREATE OR REPLACE FUNCTION fsj_internal.gerar_ocorrencias()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public', 'fsj_internal'
AS $function$
DECLARE t public.tarefas; novo_id text; today date:=(now() at time zone 'America/Recife')::date; total integer:=0;
BEGIN
 FOR t IN SELECT * FROM public.tarefas
 WHERE (proxima_repeticao<today AND (
  situacao IN ('Concluída','Arquivado') OR (
   periodicidade IN ('semanal','quinzenal','mensal','trimestral','semestral','anual')
   AND EXISTS (SELECT 1 FROM public.retornos r WHERE r.tarefa_id=tarefas.id
     AND r.tipo='sim' AND r.cancelado_por_revisao IS NULL
     AND coalesce(r.dia_previsto,(r.criado_em AT TIME ZONE 'America/Recife')::date)
         BETWEEN (tarefas.criada_em AT TIME ZONE 'America/Recife')::date AND tarefas.proxima_repeticao)
  )
 ))
 OR (periodicidade='diaria' AND situacao='Arquivado' AND EXISTS(
  SELECT 1 FROM public.tarefas_arquivamentos a WHERE a.tarefa_id=tarefas.id AND (a.aprovado_em at time zone 'America/Recife')::date<today))
 FOR UPDATE SKIP LOCKED LOOP
  IF EXISTS(SELECT 1 FROM public.tarefas WHERE ocorrencia_anterior_id=t.id) THEN CONTINUE; END IF;
  novo_id:=gen_random_uuid()::text;
  INSERT INTO public.tarefas(id,descricao,grupo_id,diaria,periodicidade,prioridade,situacao,referencia_repeticao,repeticao_indice,ocorrencia_anterior_id,exige_supervisao,duracao_execucao_minutos)
  VALUES(novo_id,t.descricao,t.grupo_id,t.periodicidade='diaria',t.periodicidade,t.prioridade,'Em aberto',today,0,t.id,t.exige_supervisao,t.duracao_execucao_minutos);
  INSERT INTO public.tarefa_responsaveis(tarefa_id,pessoa_id) SELECT novo_id,pessoa_id FROM public.tarefa_responsaveis WHERE tarefa_id=t.id;
  UPDATE public.tarefas SET proxima_repeticao=null WHERE id=t.id;
  total:=total+1;
 END LOOP;
 RETURN total;
END $function$;
