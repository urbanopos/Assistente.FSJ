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



## Calendário mensal: salvar e consultar relatórios — 29/10/2026

Versão 20261029-calendario-relatorios-16. Em Folgas e feriados, abrir o calendário, selecionar a pessoa, tocar na data, escolher Folga semanal, Feriado ou Folga compensatória e clicar em Salvar datas. A tela confirma a gravação central. Sem pessoa selecionada ou durante a consulta, a edição fica indisponível. Datas existentes são carregadas do servidor. O salvamento atualiza somente folgas_datas e folgas_motivos da pessoa escolhida, preservando os demais campos cadastrais. Falha mantém as marcações pendentes. É necessário salvar antes de trocar pessoa ou fechar. Marcar um Feriado no calendário mensal registra uma data de folga individual; não cria feriado oficial nem altera a decisão de recebimento no módulo oficial.

Consultar / Imprimir relatório está disponível na seção Folgas e feriados e dentro do calendário. Escolher uma pessoa ou Todas as pessoas e informar data inicial/final inclusivas. Consultar relatório busca novamente a armazenagem central com paginação. Reúne marcações mensais, folgas semanais, feriados oficiais com decisão individual de envio e compensações cuja data esteja no período, inclusive quando o feriado de origem estiver fora dele. Informa origem, tipo, data e pessoa; fontes distintas podem registrar o mesmo dia, por isso a contagem é de registros, não de dias únicos. O relatório retrata registros atualmente salvos, não versões anteriores de marcações excluídas. Imprimir / Salvar PDF usa a impressão do navegador, em A4 paisagem, com cabeçalho repetido. Permitir a janela de impressão se bloqueada no celular.

Permissões: utiliza sessão e RLS existentes de pessoas, folgas_semana, feriados_fsj e feriados_envio. Nenhuma chave privilegiada no cliente, nenhuma alteração de políticas, tabelas ou Edge Functions. A consulta SQL sob papel authenticated confirmou acesso do e-mail proprietário e zero linhas para outro e-mail. A escolha de pessoa no navegador não concede acesso administrativo.

Validações: quatro testes em tests/calendar-records.cjs para gravação restrita de campos, falha e rascunho, troca de pessoa, filtros inclusivos, compensação fora do feriado, paginação, escape de conteúdo e erro de período. Contrato tests/automatic-update-contract.cjs aprovado. Testes usam DOM/API simulados, sem alteração de datas reais; impressão e layout no aparelho do proprietário aguardam validação. O navegador de teste local não possui Chromium instalado.

Instalação: publicação da interface index.html e calendar-records.js no GitHub Pages; atualização automática existente protegida durante edição/gravação do calendário. Nenhuma instalação na VM ou nas pastas isoladas foi executada. Preservados expediente, disparos WhatsApp e permissões dos demais perfis. Não gerar backup parcial nem promover a tela ainda não validada no celular a versão de recuperação aprovada. Recuperação por reversão do commit desta interface; não apagar dados centrais já salvos e não restaurar cartões PDF.


### Mesma operação no Desktop — 29/10/2026

Versão 20261029-calendario-desktop-17. O painel web do Desktop também oferece Salvar datas e Consultar / Imprimir relatório, com pessoa e período inclusivo, usando os mesmos registros centrais do celular. Clicar normalmente na data abre a escolha de motivo no computador; clique direito e teclado continuam disponíveis. A versão anterior exigia clique direito com mouse. Não altera o layout próprio do Desktop nem cria cópia independente dos dados. Publicação GitHub Pages; cópias isoladas da VM não foram atualizadas nesta sessão. Contrato de atualização e quatro testes do calendário aprovados. Conferência visual e impressão no computador do proprietário pendentes. Recuperação: reverter somente esta alteração de interface, preservando datas centrais.
