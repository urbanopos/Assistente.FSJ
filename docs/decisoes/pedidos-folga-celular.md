# Pedidos de folga por perfil — preparação isolada

## Escopo
- O link **CONSULTA TAREFAS** continua apontando ao quadro individual `quadro.html`.
- O disparo das 7h, o texto diário e a lógica de duplicidade **não são alterados**.
- O calendário novo não substitui `weekly-off-employee.js` nem a obrigação de registrar uma folga semanal.
- `mobile-folgas-solicitacao.js` é um componente isolado, ainda **não incluído em quadro.html**.

## Regras de segurança
1. Funcionário/Visitante: a identidade deriva de `quadros_do_dia.token`, validado no servidor com expiração e pessoa ativa; jamais confiar em `pessoa_id` informado pelo navegador.
2. Pedidos: uma requisição pode conter várias datas; cada data vira registro independente `pendente`.
3. Aprovação: cada data é decidida separadamente. `aprovada` e `recusada` não são equivalentes.
4. Gestor: validar sessão Supabase Auth no servidor **e** delegação específica concedida pelo Proprietário. Não basta o texto do perfil no navegador.
5. Agenda do funcionário: apresentar somente datas com situação `aprovada` como folgas concedidas; pedidos pendentes podem aparecer em área de acompanhamento, claramente separados.
6. Não expor chave de serviço no cliente. Não permitir gravação direta da tabela pelo Data API público.
7. A aprovação deve ser considerada no planejamento de tarefas e nos envios apenas depois de integração testada e aprovada; **não alterar o serviço das 7h neste trabalho**.

## Plano de ativação
- Revisar modelo de delegação do Gestor e identidade da pessoa.
- Revisar e aplicar a migração em `docs/sql/fsj-pedidos-folga.sql` com RLS ativo.
- Implementar Edge Function exclusiva de pedidos com validação no servidor.
- Adicionar testes de negação de acesso, expiração, duplicidade e aprovação individual.
- Conectar componente ao quadro apenas em dispositivo móvel; preservar navegação por setas e ícone de casa.
- Testar na cópia isolada e publicar somente após testes e cópia de segurança da versão atual.

**Estado:** implementação em ramificação, não publicada, não instalada na VM.
