alter table public.retornos add column itens_faltantes text not null default '', add column tarefa_proprietario_id text references public.tarefas(id) on delete set null;
alter table public.retornos add constraint retornos_itens_faltantes_validos check(char_length(itens_faltantes)<=2000 and (itens_faltantes='' or tipo='nao'));
create function public.fsj_registrar_resposta(p_token uuid,p_resposta text,p_justificativa text,p_itens_faltantes text default '') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare l public.links_resposta; rid uuid; owner_id text; task_id text; task_name text; employee text; content text;
begin
 p_justificativa=btrim(coalesce(p_justificativa,''));p_itens_faltantes=btrim(coalesce(p_itens_faltantes,''));
 if p_resposta not in ('sim','nao') or p_resposta is null or char_length(p_justificativa)>2000 or char_length(p_itens_faltantes)>2000 or (p_resposta='nao' and p_justificativa='') or (p_resposta='sim' and p_itens_faltantes<>'') then raise exception 'Resposta invalida' using errcode='22023';end if;
 select * into l from public.links_resposta where token=p_token for update;
 if l.token is null or l.expira_em<=now() or l.dia<>(now() at time zone 'America/Recife')::date then raise exception 'Link expirado ou invalido' using errcode='22023';end if;
 if not exists(select 1 from public.pessoas where id=l.pessoa_id and ativo) or not exists(select 1 from public.tarefa_responsaveis where tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id) then raise exception 'Tarefa indisponivel' using errcode='22023';end if;
 -- Serializes different tokens for the same person/task as well as retries of this token.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(l.tarefa_id||'|'||l.pessoa_id||'|'||l.dia::text,0));
 if l.respondido_em is not null or exists(select 1 from public.retornos where tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id and criado_em>=l.dia+time '03:00' at time zone 'UTC' and criado_em<(l.dia+1)+time '03:00' at time zone 'UTC') then raise exception 'Esta tarefa ja recebeu resposta' using errcode='23505';end if;
 select descricao into task_name from public.tarefas where id=l.tarefa_id;
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
 insert into public.retornos(tarefa_id,pessoa_id,origem,tipo,conteudo,itens_faltantes,tarefa_proprietario_id) values(l.tarefa_id,l.pessoa_id,'formulario',p_resposta,content,p_itens_faltantes,task_id) returning id into rid;
 update public.links_resposta set respondido_em=now() where token=p_token;
 return jsonb_build_object('id',rid,'tarefa_proprietario_id',task_id);
end $$;
revoke all on function public.fsj_registrar_resposta(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.fsj_registrar_resposta(uuid,text,text,text) to service_role;
