# Central de instalação Reserva

Tela inicial da própria VM: solicitar acesso, consultar aprovação vigente, baixar Android e solicitar atualização das telas pelo mecanismo existente. Usuários com sessão normal podem verificar atualização. APK e autorização são independentes: esconder oferta não bloqueia o endpoint público do pacote; acesso aos dados continua sujeito ao backend. Android nativo já verifica versões pelo mecanismo existente, sem nova ponte JS. Não oferece instalador iOS nativo.

Configuração inicial: executar downloads/Ativar-Central-FSJ.cmd no Windows da fazenda. Aplica somente um acréscimo no static/app.js, preserva alterações e cria backup. Reabrir login para testar. Nenhum comando foi executado na VM real nesta entrega.

Teste: node test.cjs com jsdom disponível. Foram testados aprovação, pendência, bloqueio, expiração, sessão restrita e repetição do instalador. Atualização do APK em aparelho e acesso externo ainda exigem teste real.
