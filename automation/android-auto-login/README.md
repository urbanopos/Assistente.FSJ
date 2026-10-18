# Entrada direta Android

Ajuste incremental da interface da VM para Android 14/15 com bridge de credenciais existente. Autentica uma vez ao abrir usando o acesso salvo; não repete tentativas, não substitui sessão existente e mantém toda autorização no backend. Primeiro cadastro oferece salvar acesso e só grava após confirmação de sessão. Sair apaga o acesso salvo.

No Windows da fazenda: baixar e executar downloads/Ativar-Entrada-Direta-FSJ.cmd, informar senha SSH do Debian. O instalador altera somente static/app.js, preserva outras alterações e cria backup. Não requer novo APK se o aparelho já suporta salvar senha. Não foi executado na VM ou em aparelho real nesta entrega.

Testes: node test.cjs (jsdom disponível no NODE_PATH), python3 test-install.py. Sem envio de mensagens.
