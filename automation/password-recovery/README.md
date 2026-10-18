# Recuperacao de senha do Reserva local

Implementacao para o servidor local em `192.168.1.114:8443`. A pasta contem o modulo Python, interface, instalador da VM e receptor WhatsApp separado para Windows. Nao altera a automacao de tarefas das 7h.

## Ativacao

1. Executar `install-vm.py /home/urbano/fsj-video-v001` no Debian. O instalador valida os pontos de insercao, cria backup e reinicia o servico; chamadas em andamento sao interrompidas.
2. Executar `install-windows.ps1` no PowerShell do Windows. Requer Node 22+, npm, SSH e acesso HTTPS a VM. Dependencias sao instaladas numa pasta privada em `%LOCALAPPDATA%/FSJ-Recuperacao-Senha`.
3. Escanear o QR na janela que sera aberta, com o WhatsApp que enviara os codigos. Esta sessao usa perfil proprio; nao compartilha o perfil da rotina das 7h.
4. No Reserva, Proprietario: Autorizações e contas, selecionar a pessoa cadastrada e acionar **Confirmar WhatsApp de recuperacao**. Informar DDD e numero previamente conferido. Nenhum numero informado pelo solicitante e automaticamente considerado confirmado.
5. Participante: **Esqueci minha senha**, informar login, solicitar codigo, inserir os seis digitos e repetir a nova senha de 10 a 200 caracteres.

## Funcionamento

- Validade de 300 segundos contados da solicitacao; atraso no envio nao renova o prazo.
- Uso unico, cinco tentativas de codigo, no minimo um minuto entre novos envios, limites por IP.
- Novo pedido invalida codigos anteriores. Pedido repetido no primeiro minuto mantem o mesmo identificador sem reenviar.
- Somente contas ativas ou aprovadas com telefone confirmado pelo Proprietario recebem mensagem. Resposta publica generica evita confirmar a existencia de um login.
- Senha gravada com o scrypt ja usado pelo servidor; redefinicao e consumo do codigo ocorrem na mesma transacao SQLite. Sessoes existentes sao revogadas.
- O codigo fica na fila privada apenas ate a confirmacao do envio ou expiracao. Para verificacao e guardado HMAC com segredo privado. Codigo, segredo e senha nunca sao impressos nos logs.
- O receptor autentica por token privado, verifica certificado HTTPS pela CA da VM e usa uma concessao por pedido. Nao repete envios incertos. Em caso de falha, solicitar outro codigo depois de um minuto.
- O Windows e a VM devem permanecer ligados, com sessao Windows iniciada e WhatsApp vinculado. A tarefa `FSJ-Recuperacao-Senha` inicia no logon e e independente de `FSJ-Tarefas-07h`.
- A vinculacao do WhatsApp pode expirar; reexecutar o instalador para vincular novamente. O recurso nao usa API paga de mensagens e depende do funcionamento do WhatsApp Web.

## Validacao e limites

Testes HTTP locais verificam confirmacao exclusiva pelo Proprietario, numero invalido, autenticacao do receptor, TTL de 300 segundos, limite e uso unico, confirmacao de entrega, codigo incorreto, codigo expirado, conta bloqueada, preservacao do cadastro, troca de hash e revogacao de sessao. Testes da interface verificam a navegacao e envio dos campos. Sintaxe de JS e Python conferida.

O envio real pelo WhatsApp, o registro da tarefa no Windows e o recebimento no celular precisam ser confirmados na instalacao do usuario. Testes de backend nao comprovam entrega de mensagens.

O atualizador geral da VM deve incorporar este modulo e os pontos de insercao nas proximas versoes, para que uma atualizacao futura nao remova a interface ou a rota. Os instaladores fazem backup antes de alterar arquivos; o banco principal nao e substituido.
