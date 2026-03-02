// Dashboard Summary API - aggregates data for main dashboard
import { getSession } from '@/lib/auth'
import { getTaskRepository, getEventRepository, getTransactionRepository, getHabitRepository } from '@/infra/container'
import { success, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/dashboard', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/dashboard', 401)
      log.end(401)
      return unauthorized()
    }

    const ctx = { tenantId: session.tenantId, userId: session.userId }

    const [taskCounts, upcomingEvents, financeSummary, habits] = await Promise.all([
      getTaskRepository().countByStatus(ctx),
      getEventRepository().findUpcoming(ctx, 5),
      getTransactionRepository().getSummary(ctx),
      getHabitRepository().findAll(ctx),
    ])

    const todayLogs = await getHabitRepository().getLogsForDate(ctx, new Date().toISOString().split('T')[0])

    inc('api/dashboard', 200)
    log.end(200, { userId: session.userId })
    return success({
      tasks: taskCounts,
      events: upcomingEvents.map(e => ({ id: e.id, title: e.title, start_time: e.start_time, end_time: e.end_time, location: e.location })),
      finance: financeSummary,
      habits: {
        total: habits.length,
        completedToday: todayLogs.length,
        items: habits.map(h => ({ id: h.id, title: h.title, color: h.color })),
      },
      userName: session.name,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao carregar dashboard'
    inc('api/dashboard', 500)
    startLog('api/dashboard', request).end(500, { error: msg })
    return serverError(msg)
  }
}
