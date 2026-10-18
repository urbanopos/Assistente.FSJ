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
