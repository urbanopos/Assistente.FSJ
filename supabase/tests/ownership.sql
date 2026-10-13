begin;

select set_config('request.jwt.claims',json_build_object('sub',(select auth_user_id from public.fsj_titularidade),'role','authenticated')::text,true);
set local role authenticated;
do $$begin if (select count(*) from public.fsj_titularidade)<>1 then raise exception 'Proprietario nao le seu registro';end if;end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.fsj_titularidade) then raise exception 'Terceiro leu registro protegido';end if;
 if has_table_privilege('authenticated','public.fsj_titularidade','UPDATE') or has_table_privilege('authenticated','public.fsj_titularidade','INSERT') then raise exception 'Terceiro pode alterar titularidade';end if;
 if has_table_privilege('anon','public.fsj_titularidade','SELECT') then raise exception 'Acesso publico indevido';end if;
end $$;
reset role;
select pessoa_id,nome_titular,papel from public.fsj_titularidade;
rollback;
