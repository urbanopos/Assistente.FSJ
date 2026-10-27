# FSJ — Modelo de permissões seguro (pré-implantação)

## Invariantes
1. A autorização é decidida no servidor, em toda operação, independentemente da versão do aplicativo.
2. O token individual de WhatsApp é uma credencial portadora: quem o obtém pode agir enquanto válido. Não equivale à autenticação da identidade da pessoa. Não declarar segurança por perfil individual enquanto esse vínculo não for implantado.
3. O Proprietário autenticado abre links individuais somente para consulta. Não pode iniciar ou concluir em nome do executor, nem após tocar em “Abrir gestão autorizada”.
4. Ações de gestão devem ocorrer no painel do Proprietário e exigir sessão Supabase válida e titularidade confirmada pelo servidor.
5. Funcionário só vê suas atribuições; Visitante apenas consulta; Supervisor só acompanha seu escopo; Gestor autorizado apenas acompanha e orienta. Regras de criação/alteração exigem validação em endpoints e funções SQL.
6. Qualquer falha de verificação do Proprietário bloqueia as ações do leitor; não se transforma em acesso de funcionário.
7. Atualizações não podem apagar rascunhos ou executar ações; o servidor rejeita chamadas não autorizadas inclusive de clientes antigos.

## Ajuste preparado nesta branch
- `fsj-diagnostico-proprietario.js`: consulta bloqueada por padrão quando existe sessão de gestão no aparelho; valida JWT e titularidade; tenta renovar sessão; bloqueia `start`/`submit` mesmo se houver interação na interface; envia JWT nas demais consultas; botão abre painel de gestão, não impersona executor.
- Não altera as Edge Functions nem o banco; não é uma solução completa de identidade dos destinatários.
- Não publicar sem testes reais de browser e endpoints, e sem revisar a interação com navegação móvel.

## Testes de aceitação antes da implantação
- Proprietário com sessão válida: consulta liberada, iniciar/concluir negados, botão abre gestão.
- Proprietário com sessão expirada/revogada: falha fechada; sem mutação.
- Funcionário com link válido e sem sessão de gestão: iniciar/responder conforme autorização de token e regras de expediente/folga.
- Link expirado, de outra pessoa, revogado ou arquivado: rejeitado.
- Visitante: consulta sem gravação.
- Supervisor: somente tarefas vinculadas ao escopo; sem criação/alteração.
- Gestor autorizado: acompanhamento/orientação apenas; sem criação/início/conclusão por terceiros.
- Atualização com rascunho: preservar texto, arquivos e token; sem perda de resposta.
- Verificar no servidor todos os RPCs SECURITY DEFINER, permissões EXECUTE, revogação de tokens e endpoints públicos; executar testes negativos não destrutivos.

## Pendências críticas
- O token portador do WhatsApp não identifica inequivocamente o destinatário; requer desenho de autenticação/vinculação de dispositivo, revogação e expiração.
- A verificação de `Origin` e CORS não constitui autenticação.
- Bloqueios no navegador são defesa em profundidade, não autorização.
- Ações administrativas ainda usam regras heterogêneas (email fixo ou titularidade); padronizar por `auth_user_id` e titularidade.
- Não ativar o “desbloqueio para agir como funcionário”: o servidor atualmente proíbe `start`/`submit` com JWT do Proprietário, e isso deve permanecer.
