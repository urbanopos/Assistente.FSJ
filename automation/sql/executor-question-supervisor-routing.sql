-- Applied and verified with rollback-only routing test.
CREATE OR REPLACE FUNCTION public.fsj_enviar_sugestao_tipo(p_token uuid, p_descricao text, p_requisicao uuid, p_tipo text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path TO ''
AS $function$
declare result jsonb; s public.sugestoes_tarefas;
begin
 if p_tipo is null or p_tipo not in ('sugestao','duvida') then raise exception 'Tipo inválido';end if;
 result=public.fsj_enviar_sugestao(p_token,p_descricao,p_requisicao);
 select * into s from public.sugestoes_tarefas where id=(result->>'id')::uuid for update;
 if s.tipo<>p_tipo and s.estado<>'aguardando' then raise exception 'Registro já decidido';end if;
 update public.sugestoes_tarefas set tipo=p_tipo where id=s.id returning * into s;
 if p_tipo='duvida' then
  update public.tarefas set descricao=replace(descricao,'Analisar sugestão de tarefa:','Responder dúvida sobre a tarefa:') where id=s.tarefa_gestor_id;
  insert into public.retornos(id,tarefa_id,pessoa_id,origem,tipo,conteudo,criado_em,tarefa_proprietario_id)
  values(s.id,s.tarefa_origem_id,s.pessoa_id,'app','pergunta',s.descricao,s.criado_em,s.tarefa_gestor_id)
  on conflict(id) do nothing;
 end if;
 return to_jsonb(s);
end $function$;
REVOKE ALL ON FUNCTION public.fsj_enviar_sugestao_tipo(uuid,text,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.fsj_enviar_sugestao_tipo(uuid,text,uuid,text) TO service_role;