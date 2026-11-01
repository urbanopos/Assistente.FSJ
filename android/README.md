# Assistente FSJ — APK exclusivo do Proprietário (fase 1)

Desenvolvimento isolado da operação atual. O GitHub Pages continua como endereço web provisório; o aplicativo Android terá interface exclusiva do Proprietário.

## Escopo inicial
- Acesso do Proprietário às suas tarefas e às funções de gestão já autorizadas: consultar, iniciar, suspender, concluir, justificar, responder dúvidas, supervisão, pessoas, relatórios e manutenção.
- Interface Android própria, independente do Desktop e dos simuladores; não copiar telas antigas indiscriminadamente.
- O Proprietário é o único perfil autorizado a aprovar alterações de páginas e funcionalidades. Alterações de código exigem fluxo de publicação versionado e auditável, nunca execução arbitrária de código pelo APK.
- Acesso do Proprietário sem bloqueio de horário.
- O APK pode abrir a interface web temporária enquanto os serviços nativos são construídos, mas não pode assumir que um endereço público é protegido.

## Segurança obrigatória
- Identidade do Proprietário validada no servidor, com sessão revogável e autenticação forte.
- O servidor verifica autorização em cada operação; nome, link, pasta, código do APK ou identificador do aparelho não são provas suficientes.
- Nenhuma credencial administrativa embutida no APK.
- Registros oficiais armazenados em serviço privado com controle de acesso, não em pastas publicadas pelo GitHub Pages.
- Mudanças nos registros com trilha de auditoria e backup recuperável.
- Qualquer cache local de dados privados precisa ser criptografado e ter política de expiração/revogação.

## Critérios para primeira instalação
1. Código Android compilável e APK assinado.
2. Autenticação e autorização do Proprietário verificadas no backend.
3. Navegação e funções básicas testadas com dados de teste antes de usar registros reais.
4. Preservação comprovada dos registros existentes e possibilidade de rollback.
5. Instalação no aparelho do Proprietário e validação prática.

## Estado
Escopo exclusivo do Proprietário aprovado e documentado. APK ainda não compilado; nenhuma alteração em produção.
