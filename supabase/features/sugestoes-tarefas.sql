create table public.sugestoes_tarefas (
 id uuid primary key default gen_random_uuid(), pessoa_id text not null references public.pessoas(id),
 tarefa_origem_id text not null references public.tarefas(id), tarefa_gestor_id text not null references public.tarefas(id),
 requisicao uuid not null, descricao text not null check(length(descricao) between 1 and 2000),
 estado text not null default 'aguardando' check(estado in ('aguardando','aprovada','rejeitada')),
 observacoes text not null default '' check(length(observacoes)<=2000),
 criado_em timestamptz not null default now(), decidido_em timestamptz, decidido_por uuid,
 unique(pessoa_id,requisicao)
);
alter table public.sugestoes_tarefas enable row level security;
revoke all on public.sugestoes_tarefas from anon,authenticated;
grant all on public.sugestoes_tarefas to service_role;
create index sugestoes_tarefas_pessoa on public.sugestoes_tarefas(pessoa_id,criado_em desc);
create index sugestoes_tarefas_gestor on public.sugestoes_tarefas(tarefa_gestor_id);

create function public.fsj_enviar_sugestao(p_token uuid,p_descricao text,p_requisicao uuid) returns jsonb
language plpgsql set search_path='' as $$
declare l public.links_resposta; s public.sugestoes_tarefas; gestor text; tid text; nome text;
begin
 p_descricao=btrim(coalesce(p_descricao,''));
 if length(p_descricao) not between 1 and 2000 or p_requisicao is null then raise exception 'Sugestão inválida';end if;
 select * into l from public.links_resposta where token=p_token;
 if l.token is null or l.expira_em<=now() or not exists(select 1 from public.pessoas where id=l.pessoa_id and ativo) or not exists(select 1 from public.tarefa_responsaveis where tarefa_id=l.tarefa_id and pessoa_id=l.pessoa_id) then raise exception 'Link indisponível';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(l.pessoa_id||p_requisicao::text,0));
 select * into s from public.sugestoes_tarefas where pessoa_id=l.pessoa_id and requisicao=p_requisicao;
 if found then return to_jsonb(s);end if;
 if (select count(*) from public.sugestoes_tarefas where pessoa_id=l.pessoa_id and criado_em>now()-interval '1 hour')>=20 then raise exception 'Limite de sugestões. Aguarde antes de enviar novamente.';end if;
 select pessoa_id into gestor from public.fsj_titularidade where id=true;
 if gestor is null then raise exception 'Gestor não configurado';end if;
 select coalesce(nullif(p.identificacao,''),p.nome) into nome from public.pessoas p where p.id=l.pessoa_id;
 tid='sugestao-'||pg_catalog.gen_random_uuid()::text;
 insert into public.tarefas(id,descricao,diaria,situacao,prioridade,periodicidade) values(tid,'Analisar sugestão de tarefa: '||p_descricao||chr(10)||'Solicitante: '||nome,false,'Em aberto','urgente','pontual');
 insert into public.tarefa_responsaveis(tarefa_id,pessoa_id) values(tid,gestor);
 insert into public.sugestoes_tarefas(pessoa_id,tarefa_origem_id,tarefa_gestor_id,requisicao,descricao) values(l.pessoa_id,l.tarefa_id,tid,p_requisicao,p_descricao) returning * into s;
 return to_jsonb(s);
end $$;

create function public.fsj_decidir_sugestao(p_id uuid,p_estado text,p_observacoes text,p_gestor uuid) returns jsonb
language plpgsql set search_path='' as $$
declare s public.sugestoes_tarefas; pid text;
begin
 select pessoa_id into pid from public.fsj_titularidade where id=true and auth_user_id=p_gestor;
 if pid is null then raise exception 'Acesso negado';end if;
 if p_estado is null or p_estado not in ('aprovada','rejeitada') or length(btrim(coalesce(p_observacoes,''))) not between 1 and 2000 then raise exception 'Informe a decisão e sua justificativa';end if;
 select * into s from public.sugestoes_tarefas where id=p_id for update;
 if not found then raise exception 'Sugestão não encontrada';end if;
 if s.estado<>'aguardando' then
  if s.estado=p_estado and s.observacoes=btrim(p_observacoes) then return to_jsonb(s);end if;
  raise exception 'Sugestão já decidida';
 end if;
 update public.sugestoes_tarefas set estado=p_estado,observacoes=btrim(p_observacoes),decidido_em=now(),decidido_por=p_gestor where id=p_id returning * into s;
 update public.tarefas set situacao='Concluída',concluida_em=now(),concluida_por=pid where id=s.tarefa_gestor_id;
 return to_jsonb(s);
end $$;
revoke all on function public.fsj_enviar_sugestao(uuid,text,uuid) from public,anon,authenticated;
revoke all on function public.fsj_decidir_sugestao(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.fsj_enviar_sugestao(uuid,text,uuid) to service_role;
grant execute on function public.fsj_decidir_sugestao(uuid,text,text,uuid) to service_role;

alter table public.sugestoes_tarefas add column tipo text not null default 'sugestao' check(tipo in ('sugestao','duvida'));
create function public.fsj_enviar_sugestao_tipo(p_token uuid,p_descricao text,p_requisicao uuid,p_tipo text) returns jsonb
language plpgsql set search_path='' as $$
declare result jsonb; s public.sugestoes_tarefas;
begin
 if p_tipo is null or p_tipo not in ('sugestao','duvida') then raise exception 'Tipo inválido';end if;
 result=public.fsj_enviar_sugestao(p_token,p_descricao,p_requisicao);
 select * into s from public.sugestoes_tarefas where id=(result->>'id')::uuid for update;
 if s.tipo<>p_tipo and s.estado<>'aguardando' then raise exception 'Registro já decidido';end if;
 update public.sugestoes_tarefas set tipo=p_tipo where id=s.id returning * into s;
 if p_tipo='duvida' then update public.tarefas set descricao=replace(descricao,'Analisar sugestão de tarefa:','Responder dúvida sobre a tarefa:') where id=s.tarefa_gestor_id;end if;
 return to_jsonb(s);
end $$;
revoke all on function public.fsj_enviar_sugestao_tipo(uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.fsj_enviar_sugestao_tipo(uuid,text,uuid,text) to service_role;
