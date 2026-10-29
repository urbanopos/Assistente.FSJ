alter table public.fsj_emergency_jobs drop constraint fsj_emergency_jobs_estado_check;
alter table public.fsj_emergency_jobs add constraint fsj_emergency_jobs_estado_check check(estado in ('pendente','executando','pronto_para_envio','enviado','bloqueado','incerto','expirado'));
drop index public.fsj_emergency_job_once_day;
create unique index fsj_emergency_job_once_day on public.fsj_emergency_jobs(pessoa_id,dia) where estado in ('pendente','executando','pronto_para_envio','enviado','incerto');
