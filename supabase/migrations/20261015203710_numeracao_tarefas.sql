alter table public.tarefas add column numero bigint generated always as identity unique;
alter table public.tarefas add column codigo_tarefa text generated always as ('Tar-'||lpad(numero::text,greatest(6,length(numero::text)),'0')) stored;
