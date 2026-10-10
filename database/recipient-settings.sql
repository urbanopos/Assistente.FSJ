-- Preserve the existing single recipient. Others are opt-in in Pessoas.
alter table public.pessoas
  add column receber_tarefas_whatsapp boolean not null default false,
  add column folgas_semanais smallint[] not null default '{}',
  add column folgas_datas date[] not null default '{}',
  add column jornada_inicio time not null default '07:00',
  add column almoco_inicio time not null default '12:00',
  add constraint pessoas_folgas_semanais_validas check (folgas_semanais <@ array[0,1,2,3,4,5,6]::smallint[]);
update public.pessoas set receber_tarefas_whatsapp=true
where lower(identificacao)='menininha' and ativo=true;
