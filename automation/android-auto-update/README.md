# Atualizacao automatica — Reserva Android versao 13

Mantem as chamadas e a saida automatica da versao 12. Ao abrir ou retomar o aplicativo, consulta /api/version; repete a verificacao uma vez por minuto enquanto a Activity estiver visivel. Se houver versao maior e a VM nao estiver ocupada em chamadas/exibicao, inicia o download automaticamente, sem a pergunta intermediaria do aplicativo. Nao inicia atualizacao durante o atendimento de uma chamada recebida.

O pacote precisa ter o mesmo nome, a mesma assinatura do Proprietario, numero superior ao instalado e numero igual ou superior ao anunciado pelo servidor. O Android abre a tela de instalacao; o usuario confirma a atualizacao ou autoriza a fonte na primeira vez. Nao ha instalacao silenciosa, root ou contorno das permissoes do Android.

O instalador da VM anuncia android_version 13, disponibiliza o APK assinado na rota existente e preserva os demais campos de versao, banco, senhas, vinculos e recuperacao WhatsApp. E autocontido e tambem inclui o suporte de chamadas da versao 12, se ainda nao instalado.

Versoes anteriores que ja consultam /api/version encontram a versao 13 ao abrir e usam o instalador ja existente nelas; podem mostrar a pergunta antiga uma ultima vez. Aplicativos legados sem atualizador nativo precisam instalar uma versao atual uma unica vez. Um APK apontando para endereco inacessivel tambem precisa ter o endereco corrigido antes de conseguir consultar atualizacoes.

Compilacao API35 e assinatura verificadas. Validacao local do instalador e da resposta /api/version executada. Instalacao pelo Android e fluxo em celulares fisicos ainda precisam ser confirmados pelo usuario.
