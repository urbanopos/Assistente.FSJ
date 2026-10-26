# Padrão protegido de navegação FSJ

Estabelecido em 26/10/2026. Não remover ou deslocar sem autorização expressa do proprietário.

- Na barra simplificada #fsjSimpleBar, manter, nesta ordem e juntos, os botões: seta esquerda, casa e seta direita, antes de «Menu Principal».
- Esquerda: fsjSimpleStep(-1), percorre as abas do menu para trás.
- Casa: fsjSimpleGo('dashboard'), retorna ao Início.
- Direita: fsjSimpleStep(1), percorre as abas para frente.
- Ícones SVG nítidos, uniformes, azul-escuro (#102f69), com fundo branco, cantos arredondados e foco visível.
- Desktop e celular devem manter funcionalidade e alinhamento; não confundir com setas do navegador.
- Alterações futuras devem preservar o contrato e executar o teste: node tests/fsj-navigation-contract.cjs
- Referência da implantação: commit 14f693088ffbe735ae887487b3d3f56a7d32ddf6.

A verificação detecta regressões no código; para bloquear publicações incompatíveis é necessário incluí-la como etapa obrigatória do fluxo de publicação.
