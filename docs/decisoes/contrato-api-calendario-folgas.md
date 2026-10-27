# Contrato de API — calendário mensal com aprovação semanal

**Situação:** especificação para implementação; não implantada.

## Identidade
- Pessoa: validar token UUID recebido do quadro em `quadros_do_dia`, confirmar `expira_em > now()`, obter `pessoa_id` da própria linha e confirmar `pessoas.ativo = true`. Não aceitar pessoa_id livre do cliente.
- Decisor: validar JWT por `auth.getUser(token)`; identificar titular pela tabela `fsj_titularidade`. Gestor delegado só poderá aprovar depois de conferir a delegação de autoridade no cadastro real; até lá, negar decisão de gestores não titulares.
- Não confiar em `user_metadata`, tipo de perfil enviado pelo navegador, nem chave secreta no frontend.

## Operações propostas
### `GET list` — token individual
Retorna `[{semana:'2026-10-26',dias:['2026-10-28'],situacao:'pendente',versao:1}]`, exclusivamente da pessoa autenticada.

### `POST submit` — token individual
Entrada: `{semana:'2026-10-26',dias:['2026-10-28','2026-11-01']}`.
Regras: semana deve ser segunda-feira; dias válidos, distintos e contidos no período de 7 dias; pelo menos um dia; rejeitar datas passadas; rejeitar semana pendente; registrar nova versão se a anterior estiver devolvida. Semana aprovada exige fluxo específico de revisão, sem revogar a aprovação anterior antecipadamente.

### `GET pending` — sessão do decisor
Lista semanas pendentes para a esfera de autorização do usuário. Nenhum acesso público.

### `POST decide` — sessão do decisor
Entrada: `{calendario_id:'uuid',versao:1,decisao:'aprovar'|'devolver',observacao:'...'}`.
Regras: conferir titular/delegação no servidor; decisão única para todos os dias; bloquear concorrência e versões obsoletas; registrar decisor e data. Devolução não concede folga. Aprovação registra semana inteira, mas a integração com `folgas_semana` só será feita após teste e decisão explícita sobre conflitos com a escolha semanal obrigatória.

## Casos de teste de segurança
1. Token expirado, inválido ou pessoa inativa → negar.
2. Token da pessoa A tentando ler ou enviar por B → negar.
3. Usuário autenticado sem autorização de decisão → negar.
4. Datas de duas semanas, repetidas ou inexistentes → negar.
5. Segunda decisão concorrente ou versão ultrapassada → negar.
6. Solicitação pendente não altera a agenda de folgas autorizadas.
7. Semana cruzando outubro/novembro é uma única solicitação.
8. Não modificar rotina WhatsApp das 7h, `folgas_semana` ou interfaces publicadas durante o desenvolvimento.
