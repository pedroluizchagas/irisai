Iris
O Iris é um assistente pessoal que organiza seu dia, suas metas, tarefas, compromissos, notas e finanças em um só lugar. Ele conversa com você por texto ou voz, entende o que precisa ser feito e transforma pedidos simples em ações reais: cria tarefas, agenda compromissos, registra gastos e receitas, guarda notas importantes e lembra você na hora certa.
Como ele ajuda você
Chat que faz por você
O chat é o coração do Iris. Além de responder e buscar informações, ele executa o que você pede:
“Lembrar de ligar para o Luís amanhã” → cria uma tarefa com prazo e lembrete.


“Registrar um gasto de R$ 35,00 em alimentação” → lança nas finanças.


“Anotar ideias para o projeto X” → cria uma nota organizada por tema.


“Agendar reunião com a Carla na terça às 10h” → coloca na agenda com lembrete.


“Crie uma rotina de treino às 9h” → agenda treinos recorrentes no horário solicitado.


Tarefas e projetos
Capture qualquer coisa em segundos (“ligar para o João amanhã”).


Organize por prioridade, prazo e área da vida ou do negócio.


Acompanhe o progresso com listas claras, resumos diários e próximos passos.


Agenda
Receba lembretes no momento ideal, com sugestões de horários livres.


Visualize o dia, a semana e blocos de foco para trabalhar sem interrupções.


Metas e hábitos
Defina objetivos mensais ou trimestrais.


Desdobre metas em passos alcançáveis.


Acompanhe hábitos com indicadores simples e motivadores.


Notas e conhecimento
Guarde ideias, rascunhos e decisões sem bagunça.


Encontre qualquer nota por contexto (“a proposta do cliente de Minas”).


Gere resumos automáticos de reuniões e conteúdos longos.


Finanças claras
Acompanhe entradas e saídas de maneira simples.


Veja o total por categorias e períodos.


Receba alertas de vencimentos e projeções do mês.


Rotinas e automações
Crie lembretes recorrentes (ex.: revisar metas toda segunda).


Automatize rituais do dia: check-ins, follow-ups, relatórios rápidos.


Receba sugestões de melhorias com base no seu uso.


Relatórios e insights
Resumo diário e semanal do que avançou e do que travou.


Tendências de produtividade, foco e saúde financeira.


Recomendações práticas para ajustar a rota.


Assistência proativa
Antecipação de riscos (“você tem 3 prazos para amanhã”).


Sugestões inteligentes para encaixar tarefas no seu dia real.


Lembra contextos importantes antes de cada reunião.



Em resumo: o Iris é o “cérebro organizado” que faltava para o seu dia a dia — discreto quando precisa, presente quando importa, e sempre orientado a resultados.

## Setup rápido
- Pré-requisitos: PNPM, Node 18+, variáveis de ambiente configuradas (PGHOST, PGUSER, AWS_ROLE_ARN, AWS_REGION, AUTH_SECRET).
- Instalar dependências: `pnpm install`.
- Aplicar migrações SQL em `scripts/001-setup-tenants-users.sql` até `scripts/007-setup-chat-messages.sql` usando seu cliente Postgres.
- Popular dados de exemplo: executar `scripts/008-seed.sql`.
- Executar verificação de tipos: `pnpm typecheck`.
- Subir ambiente web: `pnpm dev`. API estará em `http://localhost:3000`.
- Mobile: definir `EXPO_PUBLIC_API_URL` e rodar `pnpm --filter mobile start`.
