-- Correção FSJ: ao converter grupo em tarefa individual, remover vínculos
-- operacionais dos antigos integrantes. Histórico de execução permanece intacto.
DO $fix$
DECLARE fn text;
BEGIN
 SELECT pg_get_functiondef('public.fsj_atualizar_integrantes_grupo(text,text[],text)'::regprocedure) INTO fn;
 IF position('  update public.tarefas set grupo_id=null where grupo_id=p_grupo_id;' in fn)=0 THEN
   RAISE EXCEPTION 'Função alterada inesperadamente';
 END IF;
 fn:=replace(fn,
   '  update public.tarefas set grupo_id=null where grupo_id=p_grupo_id;',
   '  delete from public.tarefa_responsaveis where tarefa_id=any(v_tarefas) and pessoa_id<>v_restante;'
   ||chr(10)||'  update public.tarefas set grupo_id=null where grupo_id=p_grupo_id;');
 EXECUTE fn;
END $fix$;

-- Reparação específica das tarefas já convertidas do antigo grupo Geral.
WITH converted AS (
 SELECT c.pessoa_restante_id,c.tarefas_ids
 FROM public.fsj_grupos_conversoes c
 WHERE c.grupo_nome='Geral'
   AND c.convertido_em=(SELECT max(convertido_em) FROM public.fsj_grupos_conversoes WHERE grupo_nome='Geral')
)
DELETE FROM public.tarefa_responsaveis tr USING converted c
WHERE tr.tarefa_id=ANY(c.tarefas_ids)
  AND tr.pessoa_id<>c.pessoa_restante_id
  AND EXISTS (SELECT 1 FROM public.tarefas t WHERE t.id=tr.tarefa_id AND t.grupo_id IS NULL);
