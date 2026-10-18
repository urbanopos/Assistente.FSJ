# Decisao permanente — atualizacao automatica

Data: 18/10/2026. Proprietario: Urbano. Abrangencia: Assistente FSJ.Web, Assistente FSJ.VM e clientes Android/iOS/web/desktop, conforme os recursos de cada plataforma.

O aplicativo verifica a versao disponivel sempre que aberto ou retomado. Carrega automaticamente as telas atualizadas quando seguro. A operacao habitual nao exige Ctrl+F5, PowerShell, instaladores enviados por mensagens ou repeticao desta decisao. Falhas de conexao devem ser informadas sem recargas infinitas e sem perda dos registros locais.

Edicoes, rascunhos, sessoes e chamadas devem ser preservados. A atualizacao pode ser adiada durante atividade e retomada automaticamente. Datas aleatorias na URL nao substituem uma identificacao de versao coerente. A declaracao de versao no HTML e no JavaScript deve coincidir; a mesma versao nao deve provocar uma nova recarga. Cache antigo nao deve gerar um ciclo de redirecionamento.

O Android permite baixar e verificar o APK automaticamente, mas a instalacao depende da confirmacao do sistema. Manter pacote e assinatura para preservar a instalacao existente. A versao web no iOS recebe atualizacoes das telas; nao existe nesta entrega um instalador iOS nativo.

Configuracao inicial da infraestrutura e recuperacao de falhas do servidor sao diferentes da atualizacao habitual. Nenhum documento ou teste equivale a confirmar que uma atualizacao foi instalada na VM ou em todos os aparelhos.

## Protecao

AGENTS.md torna a decisao obrigatoria para manutencoes futuras. O teste `tests/automatic-update-contract.cjs` valida a identidade de versao e executa o controle de recarga contra repeticao e cache antigo. O workflow `Protecao da atualizacao automatica` executa esse teste em pushes e pull requests. Falhas ficam registradas no GitHub.

O workflow detecta regressoes; nao constitui, sozinho, protecao obrigatoria da branch nem impede toda publicacao. Tornar o check obrigatorio requer configuracao administrativa do repositorio. A decisao so muda por nova instrucao explicita do proprietario.
