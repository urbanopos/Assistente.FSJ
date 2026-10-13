create function public.fsj_horario_resposta(p_instante timestamptz) returns boolean
language sql immutable security invoker set search_path='' as $$
 select (p_instante at time zone 'America/Recife')::time between time '07:00' and time '12:00'
 or (p_instante at time zone 'America/Recife')::time between time '14:00' and time '16:20';
$$;
revoke all on function public.fsj_horario_resposta(timestamptz) from public,anon,authenticated;
grant execute on function public.fsj_horario_resposta(timestamptz) to service_role;
-- Preserve the deployed response routine, including task creation and execution history.
do $patch$
declare src text;
begin
 src=pg_catalog.pg_get_functiondef('public.fsj_registrar_resposta(uuid,text,text,text)'::regprocedure);
 if position('FSJ_FORA_EXPEDIENTE' in src)>0 then return;end if;
 if position(' p_justificativa=btrim' in src)=0 then raise exception 'Rotina diferente da esperada';end if;
 src=replace(src,' p_justificativa=btrim',E' if not public.fsj_horario_resposta(clock_timestamp()) then raise exception ''FSJ_FORA_EXPEDIENTE'' using errcode=''P0001'';end if;\n p_justificativa=btrim');
 execute src;
end $patch$;
