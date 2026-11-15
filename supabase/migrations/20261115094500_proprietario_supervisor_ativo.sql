-- FSJ 2026-11-15: Proprietário também exerce supervisão.
-- Registro aprovado pelo Proprietário e aplicado em produção no Supabase.
-- Idempotente: não altera outros supervisores nem revoga privilégios do Proprietário.
UPDATE public.supervisores_fsj AS s
SET ativo = true, atualizado_em = now()
FROM public.fsj_titularidade AS ft
WHERE s.pessoa_id = ft.pessoa_id
  AND s.ativo IS DISTINCT FROM true;

-- Conferência pós-restauração:
-- SELECT p.identificacao,s.ativo FROM public.fsj_titularidade ft
-- JOIN public.pessoas p ON p.id=ft.pessoa_id
-- JOIN public.supervisores_fsj s ON s.pessoa_id=ft.pessoa_id;
