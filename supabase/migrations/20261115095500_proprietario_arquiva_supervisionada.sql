-- O Proprietário autenticado pode arquivar tarefa concluída supervisionada.
-- Para outros perfis, permanece exigida aprovação da fiscalização.
-- O registro em tarefas_arquivamentos continua obrigatório.
CREATE OR REPLACE FUNCTION public.fsj_proteger_arquivamento_supervisionado()
RETURNS trigger LANGUAGE plpgsql SET search_path TO '' AS $$
BEGIN
 IF NEW.situacao='Arquivado' AND OLD.situacao IS DISTINCT FROM 'Arquivado' AND OLD.exige_supervisao THEN
   IF auth.uid() IS NOT NULL AND EXISTS(
     SELECT 1 FROM public.fsj_titularidade ft
     JOIN public.pessoas p ON p.id=ft.pessoa_id AND p.ativo=true
     WHERE ft.auth_user_id=auth.uid()
   ) THEN
     RETURN NEW;
   END IF;
   IF NOT EXISTS(
     SELECT 1 FROM public.fsj_fiscalizacoes f
     WHERE f.tarefa_id=OLD.id AND f.decisao='aprovada'
       AND f.id=(SELECT max(id) FROM public.fsj_fiscalizacoes WHERE tarefa_id=OLD.id)
   ) THEN
     RAISE EXCEPTION 'Tarefa supervisionada requer aprovação antes de arquivar';
   END IF;
 END IF;
 RETURN NEW;
END $$;
