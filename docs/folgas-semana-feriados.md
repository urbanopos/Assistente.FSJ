# Folgas semanais e feriados

O quadro recebido por WhatsApp contém uma tarefa semanal de escolher um dia da semana de segunda a domingo, no fuso America/Recife. Ela aparece a partir da segunda-feira e permanece disponível nos quadros dos dias seguintes. No dia sem envio por folga ou feriado, não é enviada outra mensagem para solicitar a escolha; o calendário fica disponível no próximo quadro de um dia de trabalho.

O empregado pode mudar uma data restante da semana enquanto o gestor não a tiver definido. Quando Urbano define ou altera a data em **Folgas e feriados**, o banco bloqueia mudanças pelo empregado durante aquela semana. A semana seguinte recebe uma nova escolha, sem herdar esse bloqueio. As alterações são registradas em `folgas_historico`.

As folgas manuais em Pessoas continuam valendo e têm precedência. Informar a folga depois do disparo não desfaz uma mensagem já enviada. Datas passadas não podem ser escolhidas pelo empregado.

Os feriados nacionais fixos e a Sexta-feira da Paixão, a Data Magna de Pernambuco e os feriados de Igarassu (24/06, 27/09, 08/12) aparecem para decisão individual do gestor. Fontes oficiais são armazenadas junto às datas. O calendário é gerado para o ano atual e o seguinte, atualizando a cada virada de ano. Pontos facultativos não são tratados como feriados. Uma decisão pendente impede o envio nessa data; uma autorização de feriado não se sobrepõe à folga.

## Integração e permissões

- `folgas-semana` é uma Edge Function separada da recepção existente de respostas de tarefas.
- Empregado usa somente o token do quadro válido do dia; pessoa e semana são determinadas no banco, nunca por um identificador enviado pelo navegador.
- Alteração do gestor exige sessão Supabase validada em `/auth/v1/user` e e-mail `urbanopos@yahoo.com.br`.
- As quatro novas tabelas têm RLS. `anon` não tem acesso; `authenticated` tem leitura apenas para o gestor. Escritas e RPCs são restritos a `service_role` no servidor.
- Escolha e alteração do gestor são transações com bloqueio de linha. A alteração bloqueada não depende de botão desabilitado no navegador.
- A rotina reconsulta as regras antes da preparação, antes de conectar e imediatamente antes de transmitir. Se uma mudança bloquear o envio durante a execução, permanece a proteção do diário contra repetição automática.

## Instalação no Windows

Publicar os arquivos web e implantar a migration e a função primeiro. No computador executor, executar `node install-weekly-off.cjs` a partir de `Assistente.FSJ\automation` e depois `node --check routine.mjs`. O instalador altera somente `routine.mjs`, com backup, preservando `wa.mjs`, `core.mjs`, a sessão, a chave privada e a tarefa agendada. Não usar `git pull` no checkout principal divergente apenas para instalar esta funcionalidade.

## Validação

- `node --test automation/test.mjs automation/routine.test.mjs automation/connection.test.mjs tests/weekly-off-edge.mjs`
- `node --test tests/weekly-off-ui.cjs` (requer jsdom 26.1.0 na instalação de desenvolvimento).
- `supabase/tests/weekly-off.sql` usa dados sintéticos em uma transação com rollback: escolha, bloqueio do gestor, feriado pendente/SIM/NÃO, histórico e privilégios.
- Regressões existentes de cadastro, voz e confirmação de envio passaram. Os testes antigos `brisa.test.cjs` e `brisa-session-regression.cjs` já falham no commit base 65108a4 (mensagem esperada desatualizada e mock sem `brisaNormalizar`); esta alteração não modificou esse comportamento.

O teste online de leitura do calendário respondeu HTTP 200. A confirmação de supressão no disparo real depende da instalação do ajuste no computador executor.
