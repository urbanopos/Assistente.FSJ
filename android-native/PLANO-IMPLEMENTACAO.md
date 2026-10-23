# Assistente FSJ — Android nativo e operação offline
Status: desenvolvimento em ramificação isolada; NÃO publicado.

## Objetivo
Aplicativo Android instalado no aparelho, sem WebView como interface principal e sem depender da página GitHub Pages para abrir as telas. Reaproveitar as regras de negócio e APIs existentes após levantamento de contratos.

## Arquitetura prevista
- Kotlin + Jetpack Compose para telas nativas.
- Room/SQLite para cache de tarefas atribuídas e fila local de ações.
- WorkManager para tentar sincronização quando houver rede.
- Autenticação existente: investigar integração e renovação segura de sessão antes de codificar.
- Dados sensíveis protegidos por armazenamento seguro Android; nunca guardar senhas, chaves de serviço Supabase ou tokens privilegiados no código/aparelho.
- Vídeos e Chamadas: utilizar serviço existente somente após validar autenticação, endpoints, permissões e compatibilidade Android; comunicação ao vivo exige conexão.

## Regras offline
1. Baixar somente tarefas que o usuário autenticado está autorizado a consultar.
2. Exibir carimbo de data/hora da última sincronização.
3. Permitir registrar conclusão, justificativa, sugestões autorizadas e anexos em fila local.
4. Cada operação recebe ID único para evitar duplicação no servidor.
5. Sincronização confirma gravação remota antes de retirar operação da fila.
6. Conflitos e tarefas alteradas remotamente exigem reconciliação explícita; não sobrescrever decisões de terceiros automaticamente.
7. Logout revoga acesso e limpa dados locais conforme política definida, sem apagar operações pendentes silenciosamente.
8. Não armazenar dados de outros usuários além do escopo autorizado.
9. Bloqueio de operações de gestor/supervisor/visitante conforme permissões reais no backend; controles visuais não substituem autorização no servidor.

## Critérios para liberar
- Verificar contratos de API e esquema do banco; testes unitários, de permissões, offline/online e migração.
- Validar no Android físico em rede disponível, modo avião e retomada.
- Testar anexos, duplicações, conflitos e sincronização após reinício.
- Conferir chamadas, TV FSJ, biblioteca, vídeo institucional, gravações e acesso por papel.
- Construir APK assinado com chaves do proprietário; não publicar APK de teste como definitivo.

## FSJ.VM — política de desativação
Não remover /home/urbano/fsj-video-v001 integralmente: há servidor Python HTTPS na porta 8443, arquivos calls.py, device_calls.py, biblioteca, dados e TLS que podem atender à aba integrada.
1. Inventariar atalhos/APK da reserva, endpoints, processos, backups e arquivos compartilhados.
2. Confirmar que aplicativo Android novo e aba atual operam sem a interface FSJ.VM independente.
3. Fazer backup íntegro e teste de restauração.
4. Desativar somente interface/instalador/atalhos comprovadamente exclusivos da reserva, com janela de observação e reversão.
5. Remover arquivos redundantes somente depois de validar logs, chamadas, vídeos e tarefas; preservar serviços compartilhados, certificados e dados.

## Estado da entrega
Documento de implementação inicial. Código Android, integração de API, testes e desativação da reserva ainda pendentes.