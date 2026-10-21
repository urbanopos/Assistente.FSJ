# Identificação obrigatória por perfil — implantação controlada

Data: 2026-10-21. Escopo: todos os usuários do Assistente FSJ.

## Contrato obrigatório

1. A identidade deve ser validada pelo servidor antes de qualquer consulta ou mutação de dados privados.
2. O servidor resolve a identidade para uma única linha ativa de public.pessoas; o perfil é sempre lido da Central, jamais de parâmetros da URL, localStorage ou escolha do usuário.
3. A autorização é aplicada **no servidor** a cada requisição, não apenas escondendo abas no navegador. Em falha de autenticação, negar acesso sem conceder perfil padrão.
4. Proprietário: autenticação Supabase Auth e vínculo único com public.fsj_titularidade.auth_user_id. Não basta possuir um token Auth qualquer.
5. Gestor: permissões expressamente autorizadas pelo proprietário; não herda administração automaticamente.
6. Funcionário e Visitante: credencial individual válida, com vínculo à pessoa e validade/revogação verificadas pelo servidor; supervisão permite visualizar tarefas de terceiros, não decidir por eles. Visitante só acessa funcionalidades autorizadas.
7. Links de quadro e resposta são credenciais **limitadas àquele recurso**, não login administrativo ou identidade global. Um quadro vencido solicita nova credencial sem mudar o perfil cadastrado.
8. Sessão de celular deve consultar novamente perfil ativo/revogado ao abrir, retomar e antes de operações protegidas. Não persistir segredo em endereço público, logs ou arquivos compartilhados.
9. Nenhuma alteração pode afetar os envios das 7h, suas tabelas de controle, scripts, automações ou usuários existentes. Migração progressiva, mantendo acesso anterior até credenciais novas serem testadas.
10. Bloquear operações quando identidade ou perfil não puderem ser confirmados; mostrar mensagem clara e opção de recuperação, nunca a tela de proprietário por padrão.

## Estado encontrado

- index.html usa fsj_access_token/fsj_refresh_token para carregar painel administrativo e exibe login de proprietário quando não há token.
- public.pessoas registra categoria/ativo, mas não tem vínculo universal de identidade Auth para cada pessoa.
- public.fsj_titularidade vincula o proprietário ao auth_user_id.
- public.quadros_do_dia e public.links_resposta têm tokens limitados às tarefas; não são sessão universal.
- public.fsj_reserva_dispositivos pode servir a uma credencial vinculada, após validação do fluxo de registro e autorização.

## Etapas de entrega

1. Definir e implementar endpoint seguro /me: verificar credencial no servidor, obter pessoa_id e retornar apenas id, nome, tipo e permissões derivadas; recusar sem vínculo.
2. Inscrever cada pessoa por convite autorizado e verificar posse da credencial, com recuperação/revogação e expiração; sem acesso administrativo por link de tarefa.
3. Fazer os clientes chamarem /me antes de mostrar interface e em operações; retirar escolha de perfil. Impor as mesmas permissões nos endpoints e RLS.
4. Testar em contas de proprietário, gestor, funcionário e visitante; falhas, revogação, expiração e troca de aparelho. Confirmar disparo das 7h e testes automáticos.
5. Publicar gradualmente apenas após confirmação de que os acessos individuais existentes continuam funcionando.

## Situação

Especificação preparada em branch de desenvolvimento; **não é uma implantação funcional em produção**.
