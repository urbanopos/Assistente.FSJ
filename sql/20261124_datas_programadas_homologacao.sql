-- Aplicar somente após homologação, sem modificar regras existentes.
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS datas_programadas date[];
COMMENT ON COLUMN public.tarefas.datas_programadas IS 'Datas escolhidas pelo proprietário para execução; NULL mantém comportamento anterior.';
