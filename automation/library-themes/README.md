# Biblioteca de temas de trabalho

Implementação incremental para a VM: título, tema, descrição de até 500 caracteres, arquivo MP4/WebM ou link HTTPS do YouTube. Filtro de temas e reprodução incorporada na área do institucional. Metadados em tabela separada; permissões seguem os vídeos existentes. Cadastro reservado ao Proprietário. Nenhum vídeo é baixado do YouTube.

Arquivos: library.js, library_videos.py, install.py. O instalador lê os três na mesma pasta, confere âncoras antes de qualquer escrita e cria backup. Não substitui o aplicativo completo nem altera chamadas ou credenciais. Necessita reinício controlado do serviço, aplicação no canal assinado e validação na VM; este commit não faz implantação. Executar somente em janela sem edição/chamada. Os arquivos existentes continuam preservados.

Limites: o APK17 bloqueia recursos externos. Não liberar YouTube na WebView com ponte FSJAndroid (há acesso nativo a credenciais). Antes de habilitar no Android, implementar reprodutor isolado sem ponte e distribuir APK assinado. Até lá, a interface informa a limitação. O player incorporado funciona no navegador sujeito às permissões de incorporação do autor e conexão com a internet. Não implementa sincronização em grupo para YouTube; arquivos locais mantêm o fluxo existente. O botão Voltar ao institucional permanece disponível. Término automático de YouTube não integrado nesta versão.

Validação: python3 -m unittest discover -s automation/library-themes -p 'test_*.py'; node --check automation/library-themes/library.js. Testar cadastro de arquivo e link, permissões de cada participante, filtro, descrição, retorno ao institucional e ausência de interferência em chamadas na VM real antes da publicação assinada.
