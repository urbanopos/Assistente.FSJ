# Assistente FSJ — Correções consolidadas e prevenção de regressões
Data: 15/11/2026. Escopo: Proprietário Desktop e Celular, Pessoas e Grupos, Tarefas em Execução, Disparo Emergencial, Supabase.

## Regras obrigatórias

1. **Fonte de verdade:** cadastros de pessoas, grupos, integrantes, tarefas e responsáveis são lidos do Supabase. Após qualquer mutação, recarregar e validar a leitura central. Não apresentar confirmação de sucesso baseada apenas em memória local. Se o banco confirmar a escrita mas a leitura posterior falhar, informar que a operação foi registrada e **não mandar repetir**.
2. **Grupos excluídos:** grupo com `ativo=false` não deve aparecer em seletores operacionais de nenhuma plataforma. Manter histórico e referências históricas sem ressuscitar o grupo.
3. **Conversão de grupo:** ao salvar um grupo anteriormente com 2+ integrantes deixando **um** integrante ativo, as tarefas desse grupo passam a individuais, **sem novo número ou nova tarefa**. Preservar descrições, periodicidades, estados, registros de execução e históricos. Inserir a atribuição ao integrante restante, **excluir os vínculos operacionais de todos os demais responsáveis dessas tarefas**, desvincular o grupo das tarefas e registrar conversão em `fsj_grupos_conversoes`. A função `public.fsj_atualizar_integrantes_grupo(text,text[],text)` é a rotina central. Não alterar históricos de execução ou de conclusões.
4. **Exibição:** `Tarefas em Execução` e as demais abas devem mostrar somente os responsáveis atuais da tabela `tarefa_responsaveis`, nunca antigos integrantes do grupo já convertido. Verificar separadamente Desktop e Celular.
5. **Edição:** Proprietário pode editar integrantes do grupo nos dois modos, com interface própria de cada plataforma. Preservar layout e navegação aprovados do celular; não copiar visual Desktop para celular. Botão Salvar usa a gravação oficial.
6. **Disparo:** antes de preparar envio a destinatário, consultar o calendário **individual** da pessoa. Um feriado geral não bloqueia trabalho quando há folga compensatória registrada em outra data e identificando explicitamente o feriado compensado. Bloquear em folgas, férias e feriados não compensados/autorizados. A regra vale para todos os destinatários; o Proprietário tem acesso pleno ao sistema, sem bloqueio de expediente/folga.
7. **Segurança:** nunca remover validação de titularidade ou substituir dados reais por simulados. Não modificar registros de produção para testar sem autorização. Não publicar mudanças em um modo que alterem inadvertidamente o outro.

## Correções registradas

- Layout Pessoas — Proprietário Celular: `celular/layouts/proprietario/pessoas-layout-seguro.js`, com centralização e botão de salvar.
- Filtros de grupos ativos, edição de integrantes e revalidação após conversão: `index.html`.
- Envio emergencial e compensação de feriados no calendário individual: `supabase/functions/envio-manual/index.ts`, publicado também como Edge Function `envio-manual` no Supabase.
- Remoção de responsáveis antigos em futuras conversões e reparação pontual do grupo Geral: `supabase/migrations/20261115094000_corrigir_conversao_grupo_individual.sql`, aplicada no Supabase.
- Ocorrência verificada em 15/11/2026: grupo **Geral** convertido para Carlos, 15 tarefas; havia 18 vínculos antigos, posteriormente removidos. Confirmar por consulta ao banco antes de assumir o estado atual.

## Testes de regressão antes de cada publicação

- [ ] Desktop e Celular: criar/editar grupo com 2+ membros, sem afetar tarefas ou telas não relacionadas.
- [ ] Excluir/desativar grupo: não aparece em nenhum seletor operacional; histórico continua consultável.
- [ ] Reduzir grupo a um integrante em **ambiente de testes**: operação autorizada, mensagem correta, tarefa passa a individual, número e histórico intactos.
- [ ] Consultar no Supabase cada tarefa convertida: `grupo_id IS NULL`, exatamente **um** `tarefa_responsaveis` igual ao integrante restante; nenhum vínculo antigo.
- [ ] Abrir Tarefas em Execução em ambos os modos e conferir o campo Responsável e os filtros.
- [ ] Falha de recarga pós-escrita: não duplicar conversão, não pedir novo clique; indicar atualização da tela.
- [ ] Em feriado com compensação registrada no calendário individual, preparar envio ao trabalhador; em folga/férias, bloquear. Não enviar WhatsApp durante o teste sem autorização.
- [ ] Proprietário acessa todas as funcionalidades em qualquer data/horário; permissões dos demais permanecem.
- [ ] Confirmar que versão Celular preserva layout próprio e versão Desktop não foi alterada por ajuste visual do Celular.

## Referências de alterações anteriores

Commits conhecidos: `3c51886` (Pessoas Celular, informado na conversa), `b08a456` e `2847dce` (grupos), `e0b28bd` e `3b859c4` (conversão e validação), `fe3075f` / `76aa8ab` (disparo e calendário), `910db9b` (correção de vínculos). Conferir histórico Git antes de restaurações.

**Política de preservação:** antes de qualquer mudança futura, consultar este documento e o histórico Git; aplicar mudanças pequenas, validar dados centrais e testes por plataforma; nunca restaurar arquivo antigo isoladamente sem verificar migrações e dependências do Supabase. Este documento é uma especificação de regressão, não substitui testes automatizados.
