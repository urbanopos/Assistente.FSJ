# Ambiente de desenvolvimento — Celular / Usuário Executor

Branch: `desenvolvimento/celular-executor`.
Base inicial: `main` em 01/11/2026.

## Regras
- `main` permanece operacional. Nenhum commit de desenvolvimento é publicado nela sem aprovação expressa do Proprietário.
- Mudanças de layout, navegação, telas, funcionalidade e testes são feitas primeiro nesta branch.
- Preservar autenticação, controle de acesso, dados operacionais e links individuais; não gravar tokens ou dados de usuários no repositório.
- O botão ⟳ deve recarregar a versão de desenvolvimento mantendo o contexto autorizado, quando o ambiente estiver disponibilizado.
- Ao aprovar: registrar versão, integrar alterações à `main` com revisão e gerar pacote local para `C:\Assistente FSJ executáveis\2. Celular\1. Executor\`.
- GitHub Pages atual pode publicar somente `main`; a criação da branch não configura automaticamente uma URL independente. A prévia da branch requer publicação isolada ou mecanismo de prévia seguro antes do uso.

## Status
Branch isolada criada. Publicação independente e sincronização local ainda pendentes.
