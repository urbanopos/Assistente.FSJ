# Assistente FSJ — Android (primeira versão)

Esta ramificação isola o desenvolvimento do APK da versão operacional web.

## Objetivo
Aplicativo Android instalado no aparelho, utilizando a hospedagem web atual do GitHub Pages como ponto de entrada provisório. O APK não deve incorporar credenciais ou permissões fixas, nem presumir que a pasta ou o link autenticam o usuário.

## Regras obrigatórias antes da liberação
- Autenticação e autorização verificadas pelo servidor em cada operação protegida.
- Bloqueio de horário imposto no servidor; Proprietário isento.
- Interfaces por perfil, sem escalonamento por alteração de URL.
- Operações: listar tarefas autorizadas, iniciar, suspender com justificativa, concluir, registrar dúvidas e anexos.
- Preservar integralmente registros operacionais; sem migração automática ou alteração do banco existente.
- Acesso offline só após definir armazenamento criptografado e fila de sincronização segura.
- APK compilado e assinado em fluxo isolado; testar instalação e fluxos antes de distribuir.

## Estado
Estrutura de trabalho iniciada. Nenhum APK foi compilado ou validado nesta etapa. Nenhuma mudança em produção.
