-- FSJ: pedidos de folga. Aplicar somente após revisão de autorização.
-- Não altera folgas_semana, folgas_historico, feriados nem a rotina das 7h.
create table if not exists public.fsj_pedidos_folga (
 id uuid primary key default gen_random_uuid(),
 pessoa_id text not null references public.pessoas(id),
 dia date not null,
 situacao text not null default 'pendente' check (situacao in ('pendente','aprovada','recusada')),
 solicitado_em timestamptz not null default now(),
 decidido_em timestamptz,
 decidido_por uuid references auth.users(id),
 observacao text not null default '',
 constraint fsj_pedidos_folga_decisao check (
  (situacao='pendente' and decidido_em is null and decidido_por is null)
  or (situacao<>'pendente' and decidido_em is not null and decidido_por is not null)
 ),
 unique (pessoa_id,dia)
);
create index if not exists fsj_pedidos_folga_pessoa_idx on public.fsj_pedidos_folga(pessoa_id,dia);
create index if not exists fsj_pedidos_folga_pendentes_idx on public.fsj_pedidos_folga(situacao,solicitado_em);
alter table public.fsj_pedidos_folga enable row level security;
-- Sem policies de anon/authenticated: acesso apenas por Edge Function
-- após validação do token do quadro ou da sessão do gestor autorizado.
revoke all on public.fsj_pedidos_folga from anon, authenticated;
