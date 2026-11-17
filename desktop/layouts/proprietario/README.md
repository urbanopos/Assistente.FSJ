# Desktop — Proprietário | Contrato vigente

Atualizado em 17/11/2026. Este arquivo descreve **somente a solução atual**. Propostas, versões intermediárias e protótipos rejeitados não são instruções para implantação.

## Fonte de verdade e isolamento
- Entrada operacional: `index.html`. Adaptador do menu lateral: `desktop/layouts/proprietario/menu-lateral.js`.
- O menu lateral só se ativa no Desktop, após confirmação do perfil Proprietário. Não alterar layouts Celular/VM nem permissões de outros perfis.
- O histórico Git guarda as versões antigas; **não restaurar arquivos antigos isolados** sobre a aplicação atual.
- Manter a integridade dos dados Supabase, permissões, calendários, cores, numeração, filtros e tarefas.

## Menu lateral
- **Início** no alto; demais opções vêm do Menu Principal. Há opção de recolher e expandir.
- O clique real nos botões do menu lateral é tratado no adaptador `menu-lateral.js`; não presumir que mudar apenas `navTo` no `index.html` é suficiente.
- **Relatórios:** cada clique no item do menu, inclusive quando já está aberto, deve reiniciar para página 1, mês atual, todas as pessoas, situação Em aberto e Tarefas Periódicas; renderizar a consulta atualizada.
- Correção específica publicada em `c5ff9048a3fed4a236856e30df861b4876143395`, **ainda aguardando validação funcional do Proprietário**. Não registrar como validada antes do teste.

## Tarefas em Execução
- Filtros: Tarefas Periódicas, Tarefas Pontuais e Tarefas de Grupo. Não ressuscitar o antigo seletor independente Grupo Executor.
- Seleção de pessoa distingue suas atribuições como executor e, quando aplicável, supervisão. Grupo inclui tarefas coletivas.
- Duas tarefas por página; conservar filtros e contexto quando retornar da edição, quando disponível.
- No build `20261117-execucao-desktop-numero-decrescente-01`, alinhar os botões das três categorias à base dos seletores **Executor Individual ou Supervisor** e **Situação da tarefa**, na mesma linha quando houver espaço. Permitir quebra de linha em janelas estreitas.
- À esquerda do seletor de executor ou supervisor, o campo **Número da tarefa** localiza a tarefa pelo número, inclusive em outras situações ou categorias. As sugestões de número aparecem em ordem decrescente. O campo usa o estilo e alinhamento dos demais seletores da linha e dispensa ditado de voz. O link abre a consulta. A edição segue as ações disponíveis para a situação encontrada.
- O link roxo e o campo Situação identificam a tarefa arquivada.
- Ao abrir a tela ou acionar novamente o item do menu lateral, aplicar **Em aberto** na página 1. Ao voltar da edição, restaurar a situação e a página da consulta anterior.
- Usar as classes comuns do sistema nos links de tarefa. Preto em aberto, azul em andamento, amarelo pendente, verde-escuro concluída, vermelho prioritária, vermelho pulsante urgente e roxo arquivada.
- Agrupar as setas e o indicador de página no centro do painel, com uma seta de cada lado e distância do avatar da MarIA. A consulta vazia oculta o paginador.

- Teste automatizado: `node --test tests/desktop-proprietario-regressao.cjs`, com Playwright e Chromium. Exercita o menu lateral, as cores e a posição do rodapé a partir dos arquivos operacionais.

## Ficha da tarefa

O código abre a ficha com descrição integral, ações existentes e situação atual abaixo dos botões. A situação aparece ao abrir a ficha com o valor da lista e é atualizada após a consulta. As pausas aparecem quando registradas. **Histórico e registros** reúne os detalhes de execução e os registros vinculados. **Editar** continua usando o formulário operacional.

## Minhas Tarefas
- Três categorias: Periódicas, Pontuais e Grupo. Usar atribuições reais do titular.
- Códigos pontuais exibem a letra `P` e numeração padronizada. Atualizar consulta sem alterar os registros.

## Relatórios e calendários
- Relatório mensal tem filtros de mês, pessoa, situação e categoria. Não confundir a consulta Desktop com a gravação de conclusões pelos botões dia do Celular.
- Calendário de execução do Desktop foi validado visualmente; gravação e sincronização do Celular ainda requerem teste em aparelho real.

## Critérios de manutenção
1. Identificar o componente real que recebe o clique, arquivo de origem e dependências antes do patch.
2. Fazer alteração mínima, exclusivamente no Desktop Proprietário quando este for o escopo.
3. Testar menu com aba aberta, filtros aplicados, página avançada e retorno à primeira página.
4. Preservar ponto de reversão via Git e não copiar protótipos ou backups antigos para produção.
5. Distinguir **publicado** de **validado pelo Proprietário**.

Referências técnicas: `docs/CORRECOES_CONSOLIDADAS_REGRESSAO_2026-11-15.md` e `docs/registro-melhorias-prevencao-regressoes-20261117.md`.
