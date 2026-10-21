BEGIN;
CREATE TABLE IF NOT EXISTS public.tarefas_arquivamentos(
 tarefa_id text PRIMARY KEY REFERENCES public.tarefas(id) ON DELETE CASCADE,
 aprovado_por text NOT NULL REFERENCES public.pessoas(id),
 aprovado_em timestamptz NOT NULL DEFAULT now(),
 situacao_anterior text NOT NULL,
 perfil text NOT NULL CHECK(perfil IN ('proprietario','supervisor'))
);
ALTER TABLE public.tarefas_arquivamentos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tarefas_arquivamentos FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.tarefas_arquivamentos TO service_role;
CREATE OR REPLACE FUNCTION public.fsj_aprovar_arquivamento(p_tarefa text,p_token uuid DEFAULT NULL,p_auth uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $fn$
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
 IF t.situacao<>'Concluída' AND NOT EXISTS(SELECT 1 FROM public.retornos r WHERE r.tarefa_id=t.id AND r.tipo='sim')
 THEN RAISE EXCEPTION 'A tarefa precisa estar concluída antes da aprovação';END IF;
 IF EXISTS(SELECT 1 FROM public.execucoes_tarefa e WHERE e.tarefa_id=t.id AND e.estado='em_andamento') THEN RAISE EXCEPTION 'Há execução em andamento';END IF;
 INSERT INTO public.tarefas_arquivamentos(tarefa_id,aprovado_por,situacao_anterior,perfil) VALUES(t.id,aprovador,t.situacao,perfil);
 UPDATE public.tarefas SET situacao='Arquivado',atualizada_em=now() WHERE id=t.id;
 RETURN jsonb_build_object('ok',true,'situacao','Arquivado');
END $fn$;
REVOKE ALL ON FUNCTION public.fsj_aprovar_arquivamento(text,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fsj_aprovar_arquivamento(text,uuid,uuid) TO service_role;
CREATE OR REPLACE FUNCTION public.fsj_exigir_aprovacao_arquivo()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=''
AS $fn$
BEGIN
 IF NEW.situacao='Arquivado' AND NOT EXISTS(SELECT 1 FROM public.tarefas_arquivamentos a WHERE a.tarefa_id=NEW.id)
 THEN RAISE EXCEPTION 'Arquivamento exige aprovação registrada';END IF;
 RETURN NEW;
END $fn$;
REVOKE ALL ON FUNCTION public.fsj_exigir_aprovacao_arquivo() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS fsj_exigir_aprovacao_arquivo ON public.tarefas;
CREATE TRIGGER fsj_exigir_aprovacao_arquivo BEFORE INSERT OR UPDATE OF situacao ON public.tarefas FOR EACH ROW EXECUTE FUNCTION public.fsj_exigir_aprovacao_arquivo();
DO $patch$
DECLARE def text;
BEGIN
 SELECT pg_get_functiondef(oid) INTO def FROM pg_proc WHERE oid='public.fsj_supervisor_demandas(uuid)'::regprocedure;
 IF position('when t.situacao=''Arquivado''' IN def)=0 THEN
 def=replace(def,'''situacao'',case when exists','''situacao'',case when t.situacao=''Arquivado'' then ''Arquivado'' when exists');EXECUTE def;END IF;
 SELECT pg_get_functiondef(oid) INTO def FROM pg_proc WHERE oid='public.fsj_iniciar_tarefa(uuid)'::regprocedure;
 IF position('Tarefa arquivada' IN def)=0 THEN
 def=replace(def,'select * into t from public.tarefas where id=l.tarefa_id;','select * into t from public.tarefas where id=l.tarefa_id FOR UPDATE; IF t.situacao=''Arquivado'' THEN RAISE EXCEPTION ''Tarefa arquivada'';END IF;');EXECUTE def;END IF;
 SELECT pg_get_functiondef(oid) INTO def FROM pg_proc WHERE oid='public.fsj_registrar_resposta(uuid,text,text,text)'::regprocedure;
 IF position('Tarefa arquivada' IN def)=0 THEN
 def=replace(def,'select descricao into task_name from public.tarefas where id=l.tarefa_id;','PERFORM 1 FROM public.tarefas WHERE id=l.tarefa_id FOR UPDATE; IF EXISTS(SELECT 1 FROM public.tarefas WHERE id=l.tarefa_id AND situacao=''Arquivado'') THEN RAISE EXCEPTION ''Tarefa arquivada'';END IF; select descricao into task_name from public.tarefas where id=l.tarefa_id;');EXECUTE def;END IF;
END $patch$;
COMMIT;

CREATE OR REPLACE FUNCTION fsj_internal.gerar_ocorrencias()
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path='pg_catalog','public','fsj_internal'
AS $function$
declare t public.tarefas; novo_id text; today date:=(now() at time zone 'America/Recife')::date; indice integer; total integer:=0;
begin
 for t in select * from public.tarefas
 where (proxima_repeticao<=today and situacao IN ('Concluída','Arquivado'))
 or (periodicidade='diaria' and situacao='Arquivado' and exists(
 select 1 from public.tarefas_arquivamentos a where a.tarefa_id=tarefas.id and (a.aprovado_em at time zone 'America/Recife')::date<today))
 for update skip locked loop
  if exists(select 1 from public.tarefas where ocorrencia_anterior_id=t.id) then continue;end if;
  indice:=t.repeticao_indice+1;
  while fsj_internal.vencimento(t.referencia_repeticao,t.periodicidade,indice+1)<=today loop indice:=indice+1;end loop;
  novo_id:=gen_random_uuid()::text;
  insert into public.tarefas(id,descricao,grupo_id,diaria,periodicidade,prioridade,situacao,referencia_repeticao,repeticao_indice,ocorrencia_anterior_id)
  values(novo_id,t.descricao,t.grupo_id,t.periodicidade='diaria',t.periodicidade,t.prioridade,'Em aberto',t.referencia_repeticao,indice,t.id);
  insert into public.tarefa_responsaveis(tarefa_id,pessoa_id) select novo_id,pessoa_id from public.tarefa_responsaveis where tarefa_id=t.id;
  update public.tarefas set proxima_repeticao=null where id=t.id;
  total:=total+1;
 end loop;
 return total;
end $function$;