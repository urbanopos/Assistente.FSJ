# Regras permanentes do Assistente FSJ

Antes de modificar ou publicar, leia docs/decisoes/atualizacao-automatica.md.

## Decisao do proprietario: atualizacao automatica

- FSJ.Web, FSJ.VM e os clientes devem procurar atualizacoes ao abrir e ao retomar o uso, sem exigir que o usuario execute comandos, recarregue manualmente ou receba arquivos para cada atualizacao habitual.
- Preservar dados, sessao, rascunhos, chamadas e autorizacoes. Adiar aplicacao enquanto houver edicao ou chamada em curso e retomar quando seguro.
- APK: verificar identidade e assinatura, oferecer a confirmacao de instalacao exigida pelo Android. Nunca prometer instalacao silenciosa nem contornar o sistema operacional.
- Nao confundir publicar no GitHub com aplicar na VM ou instalar no aparelho. Informar o estado real e qualquer configuracao inicial ainda necessaria.
- Nao alterar esta decisao sem nova instrucao explicita do proprietario. Nao perguntar novamente sobre uma preferencia ja definida.
- Antes de publicar mudancas em atualizacao, navegacao, instaladores ou versao, executar `node tests/automatic-update-contract.cjs` na raiz. Corrigir falhas antes de prosseguir.
- Se o teste acusar regressao, reparar o mecanismo; nao enfraquecer o teste para aprovar a alteracao.

## Manual de operação e manutenção obrigatório

- Toda melhoria, correção ou mudança de comportamento deve atualizar docs/MANUAL-OPERACAO-MANUTENCAO.md e o documento do módulo na mesma entrega, antes de declarar o trabalho concluído.
- Documentar fluxo de operação, perfis/permissões, versão ou commit, validações, instalação, backup e recuperação aplicáveis.
- Separar solicitado, publicado, instalado e validado; não apresentar critérios planejados como funcionalidades implantadas.
- Preservar decisões substituídas como histórico com indicação clara da decisão vigente; nunca orientar restauração de cartões PDF abandonados.
- Mudanças exclusivamente documentais não autorizam testes de envio, alteração de agendamentos ou reinício de serviços.

## Perfil Gestor

- Ler docs/decisoes/perfil-gestor.md antes de alterar permissões. A decisão de 22/10/2026 substitui a limitação anterior de apenas acompanhar/orientar, mas não equivale a implantação.
- Gestor operacional não recebe administração técnica, titularidade, credenciais privilegiadas nem poder de nomear Gestores. Validar permissões no servidor, sem ampliar acesso apenas por ocultação de botões.
- Não prometer impedir cópia de código público ou entregue ao navegador. Registrar honestamente o estado de implantação e validação.

## Destinatário e perfil da sessão — regra permanente

- Ler docs/decisoes/acesso-destinatario-sessao.md antes de alterar identificação, entrada, perfis, permissões ou expediente.
- O link individual mantém o destinatário, inclusive quando aberto pelo Proprietário para conferência. Sessão administrativa salva não substitui esse destinatário.
- Usuário comum jamais recebe perfil ou privilégios de Proprietário por URL, link encaminhado, token isolado ou estado local. Exigir validação da identidade titular e autorização no servidor; falhar negando o privilégio.
- Não confundir registro destes critérios com implantação integral. Preservar a distinção entre destinatário do link e identidade autenticada de quem o abre.
