-- HOMOLOGAÇÃO SOMENTE. Não executar em produção antes dos testes integrados.
-- Calendário próprio e extinção histórica da periodicidade anterior.
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS datas_programadas date[];
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS periodicidade_extinta_em timestamptz;
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS periodicidade_extinta_origem text;
COMMENT ON COLUMN public.tarefas.datas_programadas IS 'Datas próprias de execução. NULL ou vazio mantém calendário legado.';
COMMENT ON COLUMN public.tarefas.periodicidade_extinta_em IS 'Instante da conversão de periódica para pontual; preservar histórico.';
COMMENT ON COLUMN public.tarefas.periodicidade_extinta_origem IS 'Regime periódico anterior à conversão.';

-- O gatilho executa no MESMO salvamento da mudança de regime.
-- Não modifica histórico de retornos nem exclui ocorrências antigas.
CREATE OR REPLACE FUNCTION public.fsj_registrar_extincao_periodicidade()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF lower(coalesce(OLD.periodicidade,'')) NOT IN ('pontual','')
     AND lower(coalesce(NEW.periodicidade,'')) = 'pontual' THEN
    NEW.periodicidade_extinta_em := transaction_timestamp();
    NEW.periodicidade_extinta_origem := OLD.periodicidade;
  ELSIF lower(coalesce(OLD.periodicidade,'')) = 'pontual'
     AND lower(coalesce(NEW.periodicidade,'')) NOT IN ('pontual','') THEN
    -- Uma nova vigência periódica não elimina a informação histórica de extinção.
    -- Seu histórico completo deverá ser consultado em auditoria antes da reativação.
    NULL;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS fsj_extincao_periodicidade_tarefas ON public.tarefas;
CREATE TRIGGER fsj_extincao_periodicidade_tarefas
BEFORE UPDATE OF periodicidade ON public.tarefas
FOR EACH ROW EXECUTE FUNCTION public.fsj_registrar_extincao_periodicidade();
