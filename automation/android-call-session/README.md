# Reserva local — versao 12 para Android

## Comportamento

O usuario entra uma vez com login e senha. O servidor registra um vinculo de aparelho valido por 30 dias; o Android guarda o token cifrado com chave do Android Keystore e nao armazena a senha. Uma notificacao persistente indica o recebimento ativo.

Uma chamada recebida mostra Atender e Recusar. Com a permissao de tela cheia, o Android pode mostrar a tela de chamada sobre a tela bloqueada. Ao atender, o servidor cria uma sessao limitada a essa chamada e o APK abre uma tela propria, sem telas de administracao. Ao sair ou quando a chamada termina, camera e microfone sao fechados, a sessao e invalidada e o aplicativo sai. O vinculo do aparelho continua recebendo as proximas chamadas.

O botao Sair fora da chamada desvincula o aparelho e encerra tambem o recebimento. Conta bloqueada/excluida, troca de senha ou vencimento do vinculo exigem novo login. O servidor valida a autorizacao a cada consulta. A sessao limitada so acessa /api/me e as operacoes de entrada, saida, sinalizacao, consulta e encerramento da chamada autorizada. Outra sala e APIs administrativas sao rejeitadas. O fim da sala revoga a sessao na proxima consulta, mesmo se o Android fechar inesperadamente.

## Instalacao e verificacao

Executar o instalador na VM; ele valida os pontos de insercao, cria backup, instala o APK de hash fixo e reinicia o servico. Contas, senhas e recuperacao WhatsApp sao preservadas. Instalar a versao 12 nos dois Androids pelo botao da VM e entrar uma vez em cada conta. Permitir notificacoes e, se solicitado, chamadas em tela cheia.

Teste real necessario: minimizar o app de Regina, iniciar videochamada por Urbano, atender, verificar voz/video, encerrar e conferir a saida automatica; em seguida repetir outra chamada sem novo login em Regina.

## Limites

O endereco continua local: https://192.168.1.114:8443/. Os aparelhos precisam alcancar essa rede e o Windows/VM precisam permanecer ligados. Nao foi configurado acesso externo nem TURN.

Recebimento depende da permissao de notificacoes, volume, modo Nao Perturbe e politica de bateria do Android. Forcar parada desativa o recebimento; depois de reiniciar o celular, abrir o Reserva novamente. O servico em primeiro plano pode ser reiniciado pelo Android, mas entrega imediata sob Doze ou restricoes do fabricante nao e garantida. O app nao tenta ignorar permissoes, remover bloqueio do aparelho ou iniciar camera/microfone antes de Atender.

O APK foi compilado com API 35 e assinado com o certificado do proprietario (SHA256 b2e5715832c3b9c9fb02bd4a7340685361d2953cccdac6f2eece35e9ef8f1cba). Assinatura e sintaxe verificadas; o teste HTTP cobre vinculo, senha alterada, bloqueio, acesso por sala, encerramento, descarte de convite e preservacao do vinculo. Nao houve teste fisico em Android ou emulador nesta preparacao.

Gravacoes precisam ser salvas antes de encerrar, pois a saida automatica fecha a interface e sua memoria. Atualizacoes gerais futuras do servidor devem preservar este modulo e os pontos de integracao.
