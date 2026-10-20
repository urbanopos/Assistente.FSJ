# Acesso único à TV FSJ

O principal envia o access token somente ao iframe local validado por origem, janela e nonce. Não envia senha, refresh token ou credencial administrativa. A VM consulta Auth `/auth/v1/user` e a titularidade central sob RLS antes de vincular a sessão ao único proprietário local ativo. Funcionários, gestores e visitantes não são liberados automaticamente.

A sessão da VM usa cookie HttpOnly/Secure/SameSite=None/Partitioned, expira em até 15 minutos, respeita a expiração do token central e é revalidada no servidor a cada minuto. O navegador solicita renovação a cada quatro minutos; ela não repete a inicialização do módulo. A saída pelo principal apaga somente a sessão incorporada. O login nativo e suas senhas não são alterados.

É necessário que a VM tenha acesso à internet para validar o Supabase. Certificado confiável e acesso à rede local continuam necessários; o ajuste não cria acesso público nem substitui o certificado. Navegadores que bloqueiem a sessão incorporada recebem um aviso explícito.

O instalador verifica os hashes dos quatro arquivos revisados, cria backup, bloqueia novas gravações brevemente, recusa instalação durante chamada/exibição/envio e restaura o código se a reinicialização falhar. A base de contas não é regravada. A rotina das 7h não é alterada. A implantação na VM depende da execução do comando pelo proprietário.

A CSP foi ajustada para permitir os estilos existentes, o logotipo incorporado da TV FSJ e a API oficial do YouTube. Scripts inline continuam bloqueados.

Validação: 9 testes HTTPS do servidor (Auth e titularidade simulados), testes DOM das duas pontes e 4 testes do instalador. Fluxo com sessão Supabase real e navegador na rede da fazenda ainda precisa ser conferido após instalar.
