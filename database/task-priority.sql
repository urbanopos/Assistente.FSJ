alter table public.tarefas add column prioridade text not null default 'normal' check(prioridade in ('normal','prioritaria','urgente'));
