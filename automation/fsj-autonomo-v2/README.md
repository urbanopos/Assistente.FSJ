# FSJ Autônomo 2.0 — ambiente paralelo de testes

**Estado: primeira etapa criada, somente simulação. Não instalado na VM.**

Objetivo: construir um disparador autônomo na VM, sem afetar a rotina de tarefas das 7h. Durante os testes, destinatário único: Proprietário. Conteúdo: link da TV FSJ (endereço local sujeito à validação).

## Proteções
- Este primeiro módulo **não importa whatsapp-web.js**, não autentica, não envia e não exclui mensagens reais.
- Não utiliza pastas, sessão, diário ou lock do disparador atual.
- Requer pasta privada exclusiva indicada por `FSJ_V2_TEST_DIR`; registra operações simuladas e impede duas execuções simultâneas.
- Nunca registrar uma simulação como envio ou entrega real.
- Não instalar timer diário nem alterar agendadores atuais nesta fase.

## Teste na VM, após conferência dos caminhos

```bash
mkdir -p /home/urbano/fsj-autonomo-v2-teste
chmod 700 /home/urbano/fsj-autonomo-v2-teste
FSJ_V2_TEST_DIR=/home/urbano/fsj-autonomo-v2-teste node dry-run.mjs status
FSJ_V2_TEST_DIR=/home/urbano/fsj-autonomo-v2-teste node dry-run.mjs simular
FSJ_V2_TEST_DIR=/home/urbano/fsj-autonomo-v2-teste node dry-run.mjs simular
FSJ_V2_TEST_DIR=/home/urbano/fsj-autonomo-v2-teste node dry-run.mjs status
```

## Próximas etapas (dependem de diagnóstico da VM)
1. Identificar serviço efetivo das 7h, WhatsApp, lock e perfis de navegador sem modificar nenhum.
2. Criar serviço e agendador independentes, inicialmente desabilitados e sem acesso ao WhatsApp.
3. Criar transporte de teste com sessão exclusiva, lista de destinatários restrita ao número validado do proprietário e registro de IDs de mensagem. Não usar a sessão da produção simultaneamente.
4. Testar exclusão anterior, envio e resultado incerto com falhas injetadas. Exclusão para todos depende das confirmações e limites do WhatsApp.
5. Homologar testes reais autorizados; depois realizar troca controlada, com rollback e sem dois disparadores ativos.

**Nunca armazenar número de telefone, token, QR ou credenciais no repositório.**
