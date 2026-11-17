# Assistente FSJ — Registro de melhorias e prevenção de regressões

Atualização: 17/11/2026. Complemento técnico ao Manual_Assistente_FSJ_Web_VM_Minuta.docx da Biblioteca (Caderno 2 — Técnica). Este arquivo não substitui o manual nem seus históricos.

## Regra obrigatória de manutenção

1. Identificar a plataforma (Desktop, Celular Android/iOS ou VM), perfil e **componente efetivamente acionado** antes de modificar código. O mesmo nome de menu pode ter implementações distintas.
2. Localizar todos os pontos de entrada e arquivos associados: evento de clique, função de navegação, renderização, paginação, CSS e persistência. Não pressupor que editar a navegação genérica corrige um menu específico.
3. Restringir o patch ao arquivo e plataforma solicitados; preservar registros, perfis, permissões, calendário, cores, filtros, layouts e paginação aprovados.
4. Registrar antes/depois: arquivo, commit, cenário reproduzido, resultado de teste técnico e **validação do proprietário**. Publicado não significa validado.
5. Testar retorno à página inicial tanto a partir de outra seção quanto clicando novamente no mesmo item do menu; testar também após aplicar filtros e avançar páginas.
6. Não apagar a versão anterior ou seu ponto de restauração antes da validação. Evitar backups redundantes após a aprovação.

## Incidente: Relatórios no menu lateral Desktop do Proprietário

**Sintoma:** ao selecionar filtros e páginas do relatório e clicar novamente em Relatórios no menu lateral, a mesma página de resultados permanecia visível.

**Causa técnica identificada:** o menu lateral do proprietário é construído em `desktop/layouts/proprietario/menu-lateral.js`, com seu próprio tratamento de clique. A primeira tentativa alterou somente `navTo` em `index.html`; isso não garantiu a reinicialização pelo componente efetivamente utilizado.

**Correção publicada para teste:** commit `c5ff9048a3fed4a236856e30df861b4876143395`, arquivo `desktop/layouts/proprietario/menu-lateral.js`. O clique em Relatórios agora solicita reinicialização do mês, pessoa, situação, tipo e página, reabre a seção e renderiza o relatório.

**Estado:** PUBLICADO, AGUARDANDO VALIDAÇÃO FUNCIONAL do proprietário. Não marcar como concluído sem confirmação.

**Teste de aceitação:** selecionar Carlos, outubro, Tarefas Pontuais e avançar a página; clicar novamente em Relatórios no menu lateral. Esperado: página 1, mês atual, todas as pessoas, Em aberto, Tarefas Periódicas. Conferir que outros menus e o modo celular não foram alterados.

## Tarefas em Execução no Desktop do Proprietário

O menu lateral abre a consulta em **Em aberto**, na página 1, inclusive quando o item já está ativo. O retorno de uma edição recupera a consulta anterior. Os links seguem as cores vigentes por situação e prioridade. O rodapé agrupa as duas setas e o indicador no centro do painel. O teste `tests/desktop-proprietario-regressao.cjs` abre a tela com dados fictícios, aciona o menu lateral e confere as cores, a geometria e o isolamento do Celular. O GitHub Actions executa o teste quando a entrada operacional ou o layout Desktop do Proprietário é alterado. A confirmação na sessão do Proprietário é registrada após o teste de uso.

O teste também verifica a ordem decrescente das sugestões e a busca direta por número com filtros aplicados, a consulta de arquivadas pelo código roxo, a abertura da edição para itens editáveis e a posição do novo campo à esquerda do seletor de executor.

O teste carrega também o adaptador compartilhado de voz. O campo **Número da tarefa** usa `data-fsj-sem-voz` para evitar que esse adaptador adicione o botão e altere o alinhamento. A regressão confere a mesma altura, borda e espaçamento interno do seletor de executor, além de verificar o ditado em um campo comum.

## Ficha da tarefa no Desktop e no Celular

Aprovado por Urbano em 17/11/2026, para Desktop e Celular. Versão aprovada: `20261117-ficha-historico-aberto-01`, commit `a4f9e54`. O padrão vale em todas as abas do painel operacional que abriam a ficha anterior, incluindo Tarefas em Execução, consultas por situação, Minhas Tarefas e demandas individuais ou de grupo. Quando a aba abre calendário de ocorrências, o calendário conserva o fluxo próprio.

A ficha apresenta a descrição, as ações existentes, a situação logo abaixo dos botões e as pausas registradas. O teste no navegador verifica as duas larguras, a posição da situação abaixo das ações, a ausência da seção de pausas quando vazia, o histórico aberto por padrão com responsáveis, situação, registro e conclusão, e a possibilidade de recolhê-lo e o acionamento de **Editar**. O teste também simula uma consulta pendente e uma falha de histórico. A situação da lista continua abaixo dos botões nessas duas condições.

## Incidente relacionado: calendário e conclusões periódicas

O calendário de consulta do Proprietário Desktop foi validado visualmente com código de cores. **Não equivale à validação de gravação** dos botões dia do celular Executor/Supervisor.

**Pendente:** testar no celular de Carlos a conclusão em dia permitido, a mudança visual para Concluída (verde), persistência após reabrir e sincronização com o calendário do Proprietário. Preservar tolerância de um dia e as restrições de dias futuros e de alteração de status.

## Orientação de documentação

Consolidar estas ocorrências na próxima revisão do Caderno 2 do manual existente, mantendo identidade, versão e histórico. Não confundir proposta, publicado, aplicado e validado.
