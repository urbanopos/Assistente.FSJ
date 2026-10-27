-- FSJ | PROPOSTA NÃO APLICADA: solicitação e aprovação de calendário SEMANAL.
-- O mês é apenas a forma de exibição. Semana = segunda a domingo.
-- IMPORTANTE: confirmar o tipo real de public.pessoas.id antes de executar.
-- Não altera folgas_semana, folgas_historico ou envio WhatsApp das 7h.
begin;
create table if not exists public.fsj_calendarios_folga (
 id uuid primary key default gen_random_uuid(),
 pessoa_id uuid not null references public.pessoas(id),
 semana date not null,
 versao integer not null default 1 check (versao >= 1),
 situacao text not null default 'pendente'
   check (situacao in ('pendente','aprovada','devolvida')),
 solicitado_em timestamptz not null default now(),
 decidido_em timestamptz,
 decidido_por uuid references auth.users(id),
 observacao text not null default '',
 constraint fsj_calendario_semana_segunda check (extract(isodow from semana)=1),
 constraint fsj_calendario_decisao check (
   (situacao='pendente' and decidido_em is null and decidido_por is null)
   or (situacao in ('aprovada','devolvida') and decidido_em is not null and decidido_por is not null)
 ),
 unique (pessoa_id,semana,versao)
);
create table if not exists public.fsj_calendario_folga_dias (
 calendario_id uuid not null references public.fsj_calendarios_folga(id) on delete cascade,
 dia date not null,
 primary key (calendario_id,dia)
);
create index if not exists fsj_calendarios_folga_filtro
 on public.fsj_calendarios_folga(pessoa_id,semana,versao desc);
create index if not exists fsj_calendarios_folga_pendentes
 on public.fsj_calendarios_folga(situacao,solicitado_em);
alter table public.fsj_calendarios_folga enable row level security;
alter table public.fsj_calendario_folga_dias enable row level security;
revoke all on public.fsj_calendarios_folga from anon,authenticated;
revoke all on public.fsj_calendario_folga_dias from anon,authenticated;
-- Sem políticas públicas. Edge Function deve validar token de quadro
-- ou sessão + delegação do gestor e verificar datas no servidor.
-- A API deve usar transação para aprovar/devolver uma versão completa,
-- rejeitar decisões sobre versões antigas e validar cada dia dentro da semana.
-- A aprovação NÃO altera automaticamente as folgas já vigentes:
-- integração operacional posterior e explicitamente testada.
commit;
