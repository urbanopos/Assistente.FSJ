create or replace function public.fsj_pendencia_apagamento_whatsapp(p_pessoa text,p_dia date,p_ids jsonb,p_motivo text) returns jsonb
language plpgsql set search_path='' as $$
declare owner_id text; person_name text; task_id text; code text;
begin
 if p_dia is null or p_pessoa is null or jsonb_typeof(p_ids)<>'array' or jsonb_array_length(p_ids)>100 then raise exception 'Pendencia invalida'; end if;
 select coalesce(nullif(identificacao,''),nome) into person_name from public.pessoas where id=p_pessoa;
 if person_name is null then raise exception 'Participante inexistente'; end if;
 select pessoa_id into owner_id from public.fsj_titularidade where id=true;
 if owner_id is null then raise exception 'Proprietario nao configurado'; end if;
 task_id='limpeza-whatsapp-'||p_dia::text||'-'||md5(p_pessoa);
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(task_id,0));
 insert into public.tarefas(id,descricao,diaria,situacao,prioridade,periodicidade)
 values(task_id,'Apagar manualmente mensagem anterior do WhatsApp: '||person_name||chr(10)||'Referencia: '||p_dia::text||chr(10)||'A rotina nao confirmou o apagamento apos as tentativas. O envio do dia nao deve ser bloqueado por esse motivo.'||chr(10)||'Motivo: '||left(coalesce(p_motivo,'Sem confirmacao'),2000)||chr(10)||'Identificadores conhecidos: '||left(p_ids::text,6000)||chr(10)||'Abra a conversa correta e confira as mensagens antigas. Apague para todos quando o WhatsApp permitir. Se nao permitir, registre a limitacao; apagar so no proprio aparelho nao remove a copia do destinatario. Conclua esta tarefa apos a verificacao.',false,'Em aberto','urgente','pontual')
 on conflict(id) do nothing;
 insert into public.tarefa_responsaveis(tarefa_id,pessoa_id) values(task_id,owner_id) on conflict do nothing;
 select codigo_tarefa into code from public.tarefas where id=task_id;
 return jsonb_build_object('tarefa_id',task_id,'codigo_tarefa',code);
end $$;
revoke all on function public.fsj_pendencia_apagamento_whatsapp(text,date,jsonb,text) from public,anon,authenticated;
grant execute on function public.fsj_pendencia_apagamento_whatsapp(text,date,jsonb,text) to service_role;
