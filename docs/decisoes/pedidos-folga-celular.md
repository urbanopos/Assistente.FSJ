# Pedidos de folga por perfil — preparação isolada

## Escopo
- O link **CONSULTA TAREFAS** continua apontando ao quadro individual `quadro.html`.
- O disparo das 7h, o texto diário e a lógica de duplicidade **não são alterados**.
- O calendário novo não substitui `weekly-off-employee.js` nem a obrigação de registrar uma folga semanal.
- `mobile-folgas-solicitacao.js` é um componente isolado, ainda **não incluído em quadro.html**.

## Regras de segurança
1. Funcionário/Visitante: a identidade deriva de `quadros_do_dia.token`, validado no servidor com expiração e pessoa ativa; jamais confiar em `pessoa_id` informado pelo navegador.
2. Pedidos: o período de referência é sempre de segunda-feira a domingo. A pessoa marca um ou mais dias da mesma semana e envia o calendário semanal como um único pedido. Semanas diferentes exigem pedidos separados.
3. Aprovação: Proprietário ou Gestor autorizado aprova o calendário semanal inteiro em uma única decisão ou devolve a semana para correção. Não existe aprovação parcial por dia. A decisão deve ser atômica e associada à versão do calendário semanal.
4. Gestor: validar sessão Supabase Auth no servidor **e** delegação específica concedida pelo Proprietário. Não basta o texto do perfil no navegador.
5. Agenda do funcionário: apresentar somente datas com situação `aprovada` como folgas concedidas; pedidos pendentes podem aparecer em área de acompanhamento, claramente separados.
6. Não expor chave de serviço no cliente. Não permitir gravação direta da tabela pelo Data API público.
7. A cada segunda-feira inicia-se uma nova semana de marcações. Uma semana aprovada só pode ser modificada mediante nova solicitação e aprovação, preservando histórico e a versão anteriormente aprovada até a nova decisão.
8. A aprovação deve ser considerada no planejamento de tarefas e nos envios apenas depois de integração testada e aprovada; **não alterar o serviço das 7h neste trabalho**.

## Plano de ativação
- Revisar modelo de delegação do Gestor e identidade da pessoa.
- Revisar e aplicar a migração em `docs/sql/fsj-pedidos-folga.sql` com RLS ativo.
- Implementar Edge Function exclusiva de pedidos com validação no servidor.
- Adicionar testes de negação de acesso, expiração, duplicidade e aprovação individual.
- Conectar componente ao quadro apenas em dispositivo móvel; preservar navegação por setas e ícone de casa.
- Testar na cópia isolada e publicar somente após testes e cópia de segurança da versão atual.

**Estado:** implementação em ramificação, não publicada, não instalada na VM.

## Revisão de modelo necessária
O SQL inicial `docs/sql/fsj-pedidos-folga.sql` foi concebido para decisões por dia e **não deve ser aplicado**. Será substituído por modelo com cabeçalho de pedido semanal (pessoa, segunda-feira, versão, situação, decisor e datas) e itens dos dias marcados. A aprovação será uma operação única e transacional.
