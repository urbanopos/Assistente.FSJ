# Padrão definitivo do disparo das 7h

Em 19/10/2026 às 8h48 (Pernambuco), o proprietário determinou que o modelo com um único PDF e links diretos na legenda seja o utilizado daqui para frente nos disparos das 7h. A mensagem convencional permanece como reserva. Os links e o nome são individuais. TAREFAS DE TERCEIROS aparece exclusivamente quando há autorização do servidor.

O modelo dispensa a abertura do PDF para acessar as páginas: basta tocar nos links da legenda. Não pode remover barras de navegador, ferramentas do leitor PDF ou a confirmação de abertura de URL exibida pelo leitor. Os botões dentro do PDF continuam sujeitos às regras do leitor.

Implementação e instalador: automation/whatsapp-caption-v2/. O instalador aplica os módulos ao diretório local já usado pela tarefa FSJ-Tarefas-07h no Windows e ativa daily=true. Não altera o agendamento nem substitui o wa.mjs local, preservando suas validações e o formato convencional de reserva. O pacote exige o gerador compact-card-pdf.mjs e o logotipo já instalados no executor.

Estado ao preparar este registro: código publicado e testes simulados aprovados; instalação do novo pacote, substituição real e recebimento ainda dependem de execução e confirmação no Windows. A rodada anterior sem links na legenda chegou a oito participantes; Urbano permaneceu bloqueado por apagamento sem confirmação. Uma nova rodada explícita, pdf-legenda-web-v2, foi autorizada para todos os cadastros atuais elegíveis. Tem recibos próprios e impede repetição de envios já concluídos nesta nova rodada.

A dispensa de escolha de folga semanal para visitantes foi implantada separadamente. Ela não concede acesso de supervisor, não altera o telefone nem torna público um link pessoal.
