# Contrato obrigatório de arquitetura — Assistente FSJ

## Regra imutável sem autorização expressa do Proprietário

**Desktop e Celular têm layouts independentes, mas funcionalidades, permissões e registros operacionais compartilhados.** O simulador Visitante é isolado e usa apenas dados fictícios.

1. Alterações visuais em Desktop não alteram apresentação Celular e vice-versa.
2. As operações equivalentes usam a mesma regra de negócio, mesma identidade autenticada e mesmos registros no Supabase, respeitando o perfil.
3. Nunca substituir, zerar, duplicar ou migrar silenciosamente pessoas, tarefas, grupos, conclusões, folgas, feriados, supervisões e histórico.
4. Exclusões operacionais preservam a rastreabilidade histórica (ex.: grupo inativado permanece referenciado por tarefas antigas).
5. Proibir dados reais no simulador Visitante; registros fictícios persistentes são separados dos temporários.
6. Mudanças no banco exigem migração auditável, verificação de RLS, plano de recuperação e testes de integridade.
7. Antes de publicar: testar Desktop Proprietário, Celular Proprietário, Celular Executor/Supervisor, permissões e sincronização cruzada; manter a rotina automática das 7 horas suspensa salvo autorização explícita.
8. Alterações em funcionalidades compartilhadas devem ser testadas nas duas plataformas, mesmo que o layout mude apenas em uma.
9. Nenhum teste automatizado pode executar envio WhatsApp real, apagar dados reais ou ativar timers.

## Processo de publicação

Desenvolver em branch, revisar diferenças, executar testes automáticos, validar dados preservados e aprovar pelo Proprietário. Não publicar diretamente na branch de produção. Configurar no GitHub Settings → Branches/Rulesets: exigir pull request e check `contrato-fsj`, impedir bypass e restringir push direto na branch principal.

**A existência deste documento e do workflow não ativa automaticamente a proteção de branch.** A regra de GitHub deve ser configurada pelo administrador e confirmada no painel.
