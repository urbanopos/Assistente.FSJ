-- Leitura privada dos anexos de respostas pelo proprietário autenticado.
create policy fsj_gestor_ler_anexos on storage.objects for select to authenticated using (bucket_id = 'respostas-tarefas' and auth.uid() is not null and lower(auth.jwt()->>'email') = 'urbanopos@yahoo.com.br');
