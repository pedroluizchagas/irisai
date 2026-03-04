// Chat AI API - Iris Agent with tool calling
import { streamText, tool, convertToModelMessages } from 'ai'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { getTaskRepository, getEventRepository, getNoteRepository, getTransactionRepository, getChatRepository, getGoalRepository, getHabitRepository } from '@/infra/container'
import { unauthorized, error } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function POST(request: Request) {
  const log = startLog('api/chat', request)
  const session = await getSession(request)
  if (!session) {
    inc('api/chat', 401)
    log.end(401)
    return unauthorized()
  }

  const rl = checkRateLimit(request, `chat:${session.userId}`, 30, 60_000)
  if (!rl.ok) {
    inc('api/chat', 429)
    log.end(429)
    return error('Limite de requisicoes excedido. Tente novamente em instantes.', 429)
  }

  const schema = z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().optional(),
      parts: z.array(z.object({ type: z.string(), text: z.string().optional() })).optional(),
    })).min(1),
  })
  const { messages } = schema.parse(await request.json())
  const ctx = { tenantId: session.tenantId, userId: session.userId }

  const taskRepo = getTaskRepository()
  const eventRepo = getEventRepository()
  const noteRepo = getNoteRepository()
  const transactionRepo = getTransactionRepository()
  const chatRepo = getChatRepository()
  const goalRepo = getGoalRepository()
  const habitRepo = getHabitRepository()

  // Save user message
  const userMessage = messages[messages.length - 1]
  if (userMessage?.role === 'user') {
    const textContent = typeof userMessage.content === 'string'
      ? userMessage.content
      : (userMessage.parts?.filter((p: { type: string }) => p.type === 'text').map((p: { text?: string }) => p.text ?? '').join('')) || ''
    if (textContent) {
      await chatRepo.saveMessage(ctx, { role: 'user', content: textContent, metadata: null })
    }
  }

  const history = await chatRepo.getHistory(ctx, 20)
  const chatSummary = history.slice(-10).map(m => `${m.role}: ${m.content}`).join(' | ')
  const tasksResult = await taskRepo.findAll(ctx, { limit: 50 })
  const now = new Date()
  const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const deadlines = tasksResult.data
    .filter(t => t.due_date && t.status !== 'done')
    .filter(t => {
      const d = new Date(t.due_date as string)
      return d <= soon
    })
    .map(t => ({ id: t.id, title: t.title, due_date: t.due_date, priority: t.priority }))
  const upcomingEvents = await eventRepo.findUpcoming(ctx, 5)
  const goalsResult = await goalRepo.findAll(ctx, { page: 1, limit: 50 })
  const goalsDeadlines = goalsResult.data
    .filter(g => g.deadline && g.status === 'active')
    .filter(g => {
      const d = new Date(`${g.deadline}T00:00:00Z`)
      return d <= soon
    })
    .map(g => ({ id: g.id, title: g.title, deadline: g.deadline }))
  const financeSummary = await transactionRepo.getSummary(ctx)
  const contexto = {
    deadlines,
    upcomingEvents: upcomingEvents.map(e => ({ id: e.id, title: e.title, start_time: e.start_time, end_time: e.end_time, location: e.location })),
    goalsDeadlines,
    financeSummary,
    chatSummary
  }

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `Voce e a Iris, uma assistente pessoal inteligente de alta performance. Voce fala portugues brasileiro e ajuda o usuario ${session.name} a gerenciar sua vida:
- Tarefas e projetos
- Agenda e compromissos
- Notas rapidas
- Financas pessoais
- Metas e habitos

Regras:
- Sempre responda em portugues brasileiro, de forma concisa e amigavel.
- Quando o usuario pedir para criar algo, use a ferramenta apropriada e confirme a criacao.
- Quando o usuario perguntar sobre dados, busque primeiro e responda com as informacoes reais.
- Para datas, use o formato ISO. Hoje e ${new Date().toISOString().split('T')[0]}.
- Nao invente dados - use sempre as ferramentas para buscar informacoes reais.
- Seja proativa: sugira proximos passos e melhorias.

Contexto relevante (JSON):
${JSON.stringify(contexto)}`,
    messages: await convertToModelMessages(
      messages.map(m => ({
        role: m.role,
        content:
          typeof m.content === 'string'
            ? m.content
            : (m.parts?.filter(p => p.type === 'text').map(p => p.text ?? '').join('')) || ''
      }))
    ),
    tools: {
      createTask: tool({
        description: 'Cria uma nova tarefa para o usuario',
        inputSchema: z.object({
          title: z.string().describe('Titulo da tarefa'),
          description: z.string().nullable().describe('Descricao detalhada'),
          priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('Prioridade'),
          due_date: z.string().nullable().describe('Data de vencimento no formato YYYY-MM-DD'),
        }),
        execute: async ({ title, description, priority, due_date }) => {
          const task = await taskRepo.create(ctx, { title, description, status: 'todo', priority, due_date, tags: null })
          return { success: true, task: { id: task.id, title: task.title, priority: task.priority, due_date: task.due_date } }
        },
      }),
      listTasks: tool({
        description: 'Lista as tarefas do usuario com filtro opcional por status',
        inputSchema: z.object({
          status: z.enum(['todo', 'in_progress', 'done']).nullable().describe('Filtrar por status'),
        }),
        execute: async ({ status }) => {
          const result = await taskRepo.findAll(ctx, { status: status || undefined, limit: 10 })
          return { tasks: result.data.map(t => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, due_date: t.due_date })), total: result.meta.total }
        },
      }),
      completeTask: tool({
        description: 'Marca uma tarefa como concluida',
        inputSchema: z.object({
          taskId: z.string().describe('ID da tarefa'),
        }),
        execute: async ({ taskId }) => {
          const task = await taskRepo.update(ctx, taskId, { status: 'done' })
          return { success: true, task: { id: task.id, title: task.title, status: task.status } }
        },
      }),
      createEvent: tool({
        description: 'Cria um novo evento na agenda do usuario',
        inputSchema: z.object({
          title: z.string().describe('Titulo do evento'),
          description: z.string().nullable().describe('Descricao'),
          start_time: z.string().describe('Data/hora de inicio no formato ISO 8601'),
          end_time: z.string().nullable().describe('Data/hora de fim no formato ISO 8601'),
          all_day: z.boolean().describe('Se e um evento de dia inteiro'),
          location: z.string().nullable().describe('Local do evento'),
        }),
        execute: async ({ title, description, start_time, end_time, all_day, location }) => {
          const event = await eventRepo.create(ctx, { title, description, start_time, end_time, all_day, location, color: null, recurrence: null })
          return { success: true, event: { id: event.id, title: event.title, start_time: event.start_time } }
        },
      }),
      listEvents: tool({
        description: 'Lista os proximos eventos da agenda do usuario',
        inputSchema: z.object({
          limit: z.number().nullable().describe('Numero maximo de eventos a retornar'),
        }),
        execute: async ({ limit }) => {
          const events = await eventRepo.findUpcoming(ctx, limit || 5)
          return { events: events.map(e => ({ id: e.id, title: e.title, start_time: e.start_time, end_time: e.end_time, location: e.location })) }
        },
      }),
      createNote: tool({
        description: 'Salva uma nota rapida para o usuario',
        inputSchema: z.object({
          title: z.string().describe('Titulo da nota'),
          content: z.string().nullable().describe('Conteudo da nota'),
        }),
        execute: async ({ title, content }) => {
          const note = await noteRepo.create(ctx, { title, content, tags: null, is_pinned: false })
          return { success: true, note: { id: note.id, title: note.title } }
        },
      }),
      addTransaction: tool({
        description: 'Registra uma transacao financeira (receita ou despesa)',
        inputSchema: z.object({
          type: z.enum(['income', 'expense']).describe('Tipo: income (receita) ou expense (despesa)'),
          amount: z.number().describe('Valor da transacao'),
          category: z.string().describe('Categoria (ex: alimentacao, transporte, salario)'),
          description: z.string().nullable().describe('Descricao'),
          date: z.string().describe('Data no formato YYYY-MM-DD'),
        }),
        execute: async ({ type, amount, category, description, date }) => {
          const txn = await transactionRepo.create(ctx, { type, amount, currency: 'BRL', category, description, date, is_recurring: false, recurrence_interval: null })
          return { success: true, transaction: { id: txn.id, type: txn.type, amount: txn.amount, category: txn.category } }
        },
      }),
      getFinanceSummary: tool({
        description: 'Obtem o resumo financeiro do mes atual ou especificado',
        inputSchema: z.object({
          month: z.string().nullable().describe('Mes no formato YYYY-MM (opcional, padrao mes atual)'),
        }),
        execute: async ({ month }) => {
          const summary = await transactionRepo.getSummary(ctx, month || undefined)
          return summary
        },
      }),
      createGoal: tool({
        description: 'Cria uma nova meta',
        inputSchema: z.object({
          title: z.string().describe('Titulo da meta'),
          description: z.string().nullable(),
          target_value: z.number().nullable(),
          unit: z.string().nullable(),
          deadline: z.string().nullable().describe('Data limite no formato YYYY-MM-DD'),
        }),
        execute: async ({ title, description, target_value, unit, deadline }) => {
          const goal = await goalRepo.create(ctx, { title, description, target_value, unit, deadline })
          return { success: true, goal: { id: goal.id, title: goal.title, status: goal.status, deadline: goal.deadline } }
        },
      }),
      listGoals: tool({
        description: 'Lista metas com filtro por status',
        inputSchema: z.object({
          status: z.enum(['active', 'completed', 'paused']).nullable(),
          page: z.number().nullable(),
          limit: z.number().nullable(),
        }),
        execute: async ({ status, page, limit }) => {
          const result = await goalRepo.findAll(ctx, { status: status || undefined, page: page || 1, limit: limit || 10 })
          return { goals: result.data.map(g => ({ id: g.id, title: g.title, status: g.status, current_value: g.current_value, target_value: g.target_value })), total: result.meta.total }
        },
      }),
      updateGoal: tool({
        description: 'Atualiza uma meta (progresso, status, dados)',
        inputSchema: z.object({
          id: z.string(),
          title: z.string().nullable(),
          description: z.string().nullable(),
          target_value: z.number().nullable(),
          current_value: z.number().nullable(),
          unit: z.string().nullable(),
          deadline: z.string().nullable(),
          status: z.enum(['active', 'completed', 'paused']).nullable(),
        }),
        execute: async ({ id, title, description, target_value, current_value, unit, deadline, status }) => {
          const data: Record<string, unknown> = {}
          if (title !== undefined) data.title = title
          if (description !== undefined) data.description = description
          if (target_value !== undefined) data.target_value = target_value
          if (current_value !== undefined) data.current_value = current_value
          if (unit !== undefined) data.unit = unit
          if (deadline !== undefined) data.deadline = deadline
          if (status !== undefined) data.status = status
          const goal = await goalRepo.update(ctx, id, data)
          return { success: true, goal: { id: goal.id, title: goal.title, status: goal.status, current_value: goal.current_value, target_value: goal.target_value } }
        },
      }),
      createHabit: tool({
        description: 'Cria um novo habito',
        inputSchema: z.object({
          title: z.string(),
          description: z.string().nullable(),
          frequency: z.enum(['daily', 'weekly', 'monthly']).describe('Frequencia'),
          target_count: z.number().nullable(),
          color: z.string().nullable(),
        }),
        execute: async ({ title, description, frequency, target_count, color }) => {
          const habit = await habitRepo.create(ctx, { title, description, frequency, target_count: target_count || 1, color })
          return { success: true, habit: { id: habit.id, title: habit.title, frequency: habit.frequency } }
        },
      }),
      listHabits: tool({
        description: 'Lista todos os habitos',
        inputSchema: z.object({}),
        execute: async () => {
          const habits = await habitRepo.findAll(ctx)
          return { habits: habits.map(h => ({ id: h.id, title: h.title, frequency: h.frequency, is_active: h.is_active })) }
        },
      }),
      logHabit: tool({
        description: 'Registra a conclusao de um habito',
        inputSchema: z.object({
          habitId: z.string(),
          note: z.string().nullable(),
        }),
        execute: async ({ habitId, note }) => {
          const log = await habitRepo.logCompletion(ctx, habitId, note || undefined)
          return { success: true, log: { id: log.id, habit_id: log.habit_id, completed_at: log.completed_at } }
        },
      }),
      aggregatedOverview: tool({
        description: 'Retorna uma visao agregada (tarefas, eventos, metas, finanças)',
        inputSchema: z.object({}),
        execute: async () => {
          return contexto
        },
      }),
      summarizeHistory: tool({
        description: 'Gera um resumo do historico recente de conversa',
        inputSchema: z.object({
          limit: z.number().nullable().describe('Quantidade de mensagens a considerar (padrao 10)'),
        }),
        execute: async ({ limit }) => {
          const hist = await chatRepo.getHistory(ctx, typeof limit === 'number' ? limit : 10)
          const total = hist.length
          const users = hist.filter(h => h.role === 'user').length
          const assistants = hist.filter(h => h.role === 'assistant').length
          const lastUser = [...hist].reverse().find(h => h.role === 'user')?.content || ''
          const lastAssistant = [...hist].reverse().find(h => h.role === 'assistant')?.content || ''
          const concat = hist.map(h => `${h.role}: ${h.content}`).join(' | ')
          const preview = concat.length > 1000 ? concat.slice(0, 1000) + '...' : concat
          return {
            total,
            users,
            assistants,
            lastUser,
            lastAssistant,
            preview,
          }
        },
      }),
    },
    onFinish: async ({ text }) => {
      if (text) {
        await chatRepo.saveMessage(ctx, { role: 'assistant', content: text, metadata: null })
      }
      inc('api/chat', 200)
      log.end(200, { userId: session.userId, tenantId: session.tenantId })
    },
  })

  const accept = request.headers.get('accept') || ''
  const url = new URL(request.url)
  const isTextOnly = accept.includes('text/plain') || url.searchParams.get('mode') === 'text'
  return isTextOnly ? result.toTextStreamResponse() : result.toUIMessageStreamResponse()
}
