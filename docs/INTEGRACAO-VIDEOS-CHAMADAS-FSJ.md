# Integração do módulo Vídeos e Chamadas — Assistente FSJ

**Decisão do proprietário (20/10/2026):** Vídeos e Chamadas deixa de operar como aplicativo autônomo e passa a ser módulo do **Assistente FSJ — Tarefas**.

## Prioridade operacional
As funções existentes de Tarefas são prioritárias. Nenhuma integração poderá alterar, interromper ou duplicar rotinas de tarefas, folgas, relatórios, autorizações, registros ou WhatsApp, inclusive o disparo das 07:00 (America/Recife).

## Envio e notificações
- **Desativar na origem** quaisquer tentativas autônomas de envio, reenvio, convites, mensagens ou notificações automáticas executadas pelo antigo aplicativo Vídeos e Chamadas.
- Desativar seus agendadores, filas e workers de disparo **somente após inventário dos processos e validação de que não atendem às tarefas**.
- Não desligar serviços compartilhados do Assistente FSJ nem modificar a rotina WhatsApp das 07:00.
- Eventual comunicação necessária ao módulo deverá passar por um mecanismo único e autorizado do sistema principal, com permissões e prevenção de duplicidades.
- **Não confundir chamadas de vídeo em tempo real, iniciadas conscientemente por usuário autorizado, com disparos automáticos:** preservar chamadas legítimas.

## Cadastro e autorização
- O campo de seleção de quem pode assistir aos vídeos deverá consultar a **lista completa de Pessoas cadastradas no Assistente FSJ**, inclusive participantes novos, sem exigir recadastro no módulo.
- O proprietário controla autorizações de assistir, publicar e excluir separadamente; qualquer delegação deve ser explícita.
- Aplicar permissões no servidor, não apenas na interface; não expor credenciais administrativas ao navegador.
- Respeitar as restrições existentes por categoria (Funcionário, Visitante, Gestor, Proprietário), sem ampliar permissões de tarefas pela autorização para assistir a vídeos.

## Integração técnica
1. Identificar o serviço real da VM, seus processos, agendadores, filas e endpoints de envio, sem alterar produção.
2. Fazer backup dos códigos, configuração e base de autorizações antes de modificar.
3. Implementar a desativação **somente** dos disparos independentes do módulo.
4. Integrar identidade e seleção de espectadores ao cadastro central de Pessoas; migrar permissões anteriores de forma segura.
5. Integrar navegação do módulo à aba Vídeos e Chamadas do FSJ, mantendo vídeo, biblioteca, permissões e chamadas.
6. Testar autorizações, reprodução, chamadas, ausência de envios autônomos, e regressão de tarefas/WhatsApp das 07:00.
7. Implantar de forma reversível, mantendo um único executor de disparo de tarefas e espelhamento controlado GitHub/VM.

## Situação
**Critério registrado; implantação técnica pendente.** Publicar este manual não altera serviços da VM nem desativa disparos. Nenhuma intervenção no envio de tarefas das 07:00 está autorizada por este documento.
