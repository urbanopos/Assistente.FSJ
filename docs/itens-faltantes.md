# Itens Faltantes na resposta NÃO

No formulário individual, a seleção NÃO mostra o campo opcional Itens Faltantes (até 2000 caracteres). A justificativa continua obrigatória. SIM nunca transmite os itens anteriormente digitados.

O serviço chama fsj_registrar_resposta, disponível apenas ao service_role. A RPC verifica token vigente do dia, cadastro ativo e atribuição da tarefa, serializa respostas concorrentes e grava numa única transação a resposta, o vínculo e, quando há itens, uma tarefa pontual em aberto para a pessoa registrada em fsj_titularidade. Nenhum ID de Proprietário é aceito do cliente. Repetições são bloqueadas sem gerar outra tarefa.

A descrição da nova tarefa preserva os itens, solicitante, tarefa de origem e justificativa. O retorno original inclui Itens Faltantes e a indicação de encaminhamento ao Proprietário: aparece na aba Demandas e na consulta dos supervisores autorizados. A tarefa particular do Proprietário não amplia o escopo do supervisor. Sem supervisor configurado, não existe destinatário de supervisão; a demanda de Urbano é criada normalmente.

O aviso ocorre na página de supervisão, com atualização periódica já existente, e não dispara um WhatsApp adicional. A demanda do Proprietário participa da rotina diária habitual. A automação local das 7h não é alterada.

Validação: supabase/tests/missing-items.sql em transação revertida; tests/missing-items-ui.cjs e tests/missing-items-edge.mjs. Nenhuma tarefa de teste permaneceu no banco.
