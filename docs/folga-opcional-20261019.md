# Escolha semanal de folga opcional por pessoa

Implantação: 19/10/2026. Build Web: 20261019-folga-opcional-05.

Em Pessoas, selecione o cadastro. Desmarque **Exigir escolha de folga semanal** e salve para dispensar um visitante. A opção permanece marcada por padrão, inclusive em novos cadastros; selecionar Tipo Visitante não dispensa automaticamente. Não houve alteração automática de participantes existentes.

A dispensa esconde a escolha e os avisos, libera o bloqueio de registros causado exclusivamente pela ausência de folga semanal e é validada no servidor. Recebimento de WhatsApp, folgas existentes, férias, feriados e supervisão são independentes. O histórico de folgas não é apagado. Reativar a opção volta a exigir uma escolha válida da semana.

Banco: coluna public.pessoas.exigir_folga_semanal, boolean NOT NULL DEFAULT true; funções fsj_escolher_folga, fsj_exigir_folga_semanal e fsj_preparar_calendario adaptadas. RLS e permissões existentes mantidas; nenhuma nova SECURITY DEFINER. O endpoint folgas-semana mantém sua autenticação e recebe o indicador pela RPC validada por token.

Validação: testes transacionais com rollback para visitante, trabalhador, reativação, escolha indevida, token inválido e preparação de calendário. Testes de DOM: tela dispensada, bloqueio normal, reativação e falha segura. Testes de salvamento dos valores true/false nas duas etapas do cadastro. Conferida a publicação do controle no index e da regra no script entregue pelo Pages.

A substituição emergencial de WhatsApp foi preparada separadamente e não foi executada nesta sessão. Deve aguardar a configuração dos visitantes pelo proprietário. O executor Windows e a interface nativa da VM não foram modificados por esta alteração Web.
