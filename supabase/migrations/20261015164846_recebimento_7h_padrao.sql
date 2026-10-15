-- Novos cadastros recebem o quadro diário por padrão.
-- Os seis cadastros existentes já estavam habilitados; seleções salvas permanecem válidas.
alter table public.pessoas alter column receber_tarefas_whatsapp set default true;
