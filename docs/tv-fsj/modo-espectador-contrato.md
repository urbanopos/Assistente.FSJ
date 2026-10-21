# TV FSJ — Modo Espectador

## Acesso
- Disponível 24h, sem relação com a rotina de tarefas das 7h.
- Acesso exclusivamente a pessoas com `public.pessoas.ativo=true` e `public.pessoas.videos_chamadas=true`, mediante credencial autenticada e vinculada no servidor a `pessoas.id`.
- Não aceitar `pessoa_id`, `tipo`, `perfil` ou `proprietario` enviados pelo cliente como prova de identidade; não permitir escolher pessoa em lista para autenticar.
- Credenciais de `quadros_do_dia` e `links_resposta` só autorizam seus próprios recursos; não conferem acesso genérico à TV.

## Interface Espectador
- Exibir somente reprodução de TV e biblioteca de vídeos permitidos.
- Ocultar e, principalmente, **negar no backend** rotas de iniciar/atender/encerrar chamadas, convite, microfone, câmera, captura, upload, editar e excluir vídeos.
- Não conceder privilégios por parâmetros da URL ou CSS. Endpoints de chamada exigem sessão verificada e titularidade do Proprietário na Central.
- A VM deve oferecer uma rota distinta `/espectador`, sem reutilizar a página administrativa que contém controles de chamada.

## Testes obrigatórios antes da ativação
1. Proprietário mantém chamadas e administração.
2. Pessoa ativa e habilitada reproduz TV em qualquer horário, sem acesso a chamadas.
3. Pessoa não habilitada, inativa ou sem sessão recebe 403.
4. Tentativas diretas de chamadas como espectador recebem 403.
5. Links de tarefas não viram autenticação de TV.
6. Nenhuma alteração na rotina WhatsApp das 7h.

## Estado
Contrato registrado no repositório. **Pendente de implementação e publicação do servidor VM**, que não está acessível para deploy nesta integração GitHub/Supabase. Não apresentar como ativado.
