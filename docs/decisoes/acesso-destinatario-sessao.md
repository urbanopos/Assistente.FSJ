# Decisão permanente — destinatário e perfil da sessão

Data: 30/10/2026. Determinação do Proprietário Urbano. Abrangência: FSJ Web, Desktop, Celular e clientes nativos.

## Critérios obrigatórios

1. O link individual identifica seu destinatário por vínculo validado no servidor. O texto da mensagem, nome exibido, número informado pelo navegador ou parâmetro de perfil não constitui autorização.
2. O usuário comum abre somente a sessão e os recursos autorizados para o destinatário. Alterar URL, token, armazenamento local, interface ou chamada direta à API não pode conceder titularidade nem permissões de Proprietário.
3. O Proprietário pode abrir o link de um funcionário para conferir erros. Nesse acesso, o perfil e as restrições operacionais são os do funcionário, inclusive o expediente. A sessão administrativa existente no aparelho não substitui automaticamente o destinatário.
4. No link do próprio Proprietário, destinatário e perfil da sessão coincidem: Proprietário, com acesso livre de horário, mediante validação de sua identidade e titularidade.
5. Abrir ou receber um link do Proprietário não deve, por si só, conferir seu perfil a outra pessoa. O servidor deve exigir comprovação da identidade titular antes de liberar qualquer privilégio de Proprietário; na ausência dessa comprovação, negar o acesso privilegiado.
6. Funcionário, Visitante, Gestor operacional e outros usuários não podem se promover nem assumir o perfil de Proprietário. Delegação operacional não transfere titularidade ou administração técnica.
7. Tokens inválidos, vazios, expirados, revogados ou sem vínculo autorizado não podem produzir acesso privilegiado. Falha de validação deve negar o privilégio, sem recorrer ao perfil administrativo salvo no aparelho.
8. Verificar permissões em cada operação protegida no servidor, incluindo consultas, alterações, anexos e relatórios. Ocultar botões no navegador não substitui autorização.

## Expediente e conferência

Para os demais destinatários, valem 07:00–12:00 e 14:00–16:20, America/Recife. O horário de envio da mensagem é independente. Folga não acrescenta bloqueio de execução: preservar os alertas já determinados. Conferência pelo Proprietário não deve ampliar permissões do destinatário, alterar vínculos ou promover usuários.

## Estado da implementação

Critérios registrados nesta decisão. A correção 5f12ec6c03ea3d802ae3210468ed927183ccac6f preserva o destinatário na entrada individual quando existe sessão titular no mesmo aparelho, e foi publicada com testes de entrada e expediente aprovados. Isso não comprova cumprimento integral destes critérios.

Em particular, o código atual da exceção de horário aceita token válido vinculado ao titular ativo; isso não comprova, sozinho, a identidade de quem recebeu ou abriu o link. A exigência do item 5 demanda revisão da autenticação e autorização no servidor antes de declarar impedido o uso de um link do titular por terceiros. Não há nesta entrega documental nova autenticação, auditoria completa ou validação de todos os clientes.

## Validação exigida para mudanças futuras

Cobrir: funcionário em seu link; Proprietário no link de funcionário, com e sem sessão administrativa anterior; titular em seu próprio link; usuário comum com link do titular; troca de parâmetros e tokens; token inválido, vazio, expirado e revogado; revogação de sessão; chamadas diretas à API; limites de expediente. Nenhum teste pode gravar respostas reais ou enviar mensagens sem autorização específica.

Manutenção: ler esta decisão antes de alterar identificação, entrada, permissões ou expediente. Atualizar o manual e registrar separadamente solicitado, publicado, instalado e validado. Esta entrega não altera banco, sessões, tarefas, agendamentos ou serviços. Recuperação documental: reverter apenas seu commit, preservando o histórico e as correções funcionais anteriores.
