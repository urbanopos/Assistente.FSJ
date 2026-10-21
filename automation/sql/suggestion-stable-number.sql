BEGIN;
ALTER TABLE public.sugestoes_tarefas ADD COLUMN IF NOT EXISTS numero bigint GENERATED ALWAYS AS IDENTITY;
CREATE UNIQUE INDEX IF NOT EXISTS sugestoes_tarefas_numero_unique ON public.sugestoes_tarefas(numero);
REVOKE ALL ON SEQUENCE public.sugestoes_tarefas_numero_seq FROM PUBLIC,anon,authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.sugestoes_tarefas_numero_seq TO service_role;
COMMIT;