# Validação aprovada — seletores no celular (21/11/2026)

## Referência protegida
- Commit funcional aprovado: `edd8be899bec7a019a4fc5b7a5df5db036670303`.
- Arquivo de aplicação: `index.html`.
- Mudança: seletores móveis acionados em `click` após o toque, não em `pointerdown` antes de soltar o dedo. A consulta de demandas usa o mesmo padrão.
- Validação em dispositivo Android pelo proprietário: **campo Seleção de Pessoas da tela Registrar demanda funcionou**.
- Outros seletores: implementação conferida no código; **ainda não há validação funcional individual**.

## Regras de não regressão
1. Toque simples abre a lista sem exigir manter o dedo pressionado.
2. A lista permanece visível até escolha ou cancelamento; o item selecionado permanece no campo.
3. Não mudar filtros de pessoas ativas, regras de permissão, dados, registros, layout desktop ou rotinas de gravação.
4. Preservar o comportamento validado ao alterar outros módulos. Comparar futuras mudanças de `index.html` com o commit de referência e testar em Android antes de substituir a versão aprovada.
5. Não declarar testes dos demais campos concluídos sem execução real.

Este registro documenta a referência validada; **não equivale a bloqueio de branch nem a proteção administrativa do GitHub**.
