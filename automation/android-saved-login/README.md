# Reserva local 14 — salvar senha e linha de entrada compacta

Preserva a atualizacao automatica da versao 13 e chamadas/saida automatica da versao 12. O formulario mostra abaixo da senha uma unica linha com a caixa Salvar senha, o botao Mostrar/Ocultar senha e Entrar. Os controles anteriores sao movidos, preservando os eventos; nao sao duplicados.

No APK 14, marcar Salvar senha salva nome e senha apenas depois da autenticacao bem-sucedida. O conteudo e cifrado com AES-GCM por chave nao exportavel do Android Keystore, em preferencias privadas, fora do armazenamento web. Na proxima abertura preenche os campos, mas nao inicia uma sessao sem acionar Entrar. Desmarcar apaga as credenciais salvas. A saida da chamada encerra a sessao mas preserva essa escolha; o vinculo de recebimento continua separado.

O bridge so fornece/salva credenciais na pagina raiz da origem HTTPS local configurada e fora de sessoes de atendimento; a tela restrita de chamada nao pode acessar essa facilidade. Credenciais nao sao gravadas em logs ou localStorage. Senhas apagadas por versoes anteriores nao podem ser recuperadas; e necessario digita-las uma vez para salvar novamente.

No Chrome, o formulario usa autocomplete e o gerenciador de senhas do proprio navegador via Credential Management API quando disponivel. O navegador pode pedir confirmacao e precisa aceitar o contexto HTTPS. O site nao armazena senhas em texto simples no armazenamento local como alternativa. Na captura enviada pelo usuario havia uma aba do Chrome, nao a Activity do APK.

Instalador unico na VM: valida e publica APK 14 de hash fixo, altera a versao anunciada para 14, adiciona o layout e preserva contas/senhas existentes. O atualizador nativo das versoes anteriores oferece o APK; o Android ainda exige sua confirmacao. APKs legados sem atualizador precisam de uma instalacao inicial.

Validacao: compilacao, assinatura do Proprietario, instalador em copia do servidor e testes DOM de restauracao, captura somente apos autenticacao, limpeza ao desmarcar, idempotencia e ausencia de senha em localStorage. Teste fisico em Android e no gerenciador de senhas do Chrome ainda pendente.
