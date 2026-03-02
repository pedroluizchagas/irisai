// Events API - List + Create
import { getSession } from '@/lib/auth'
import { getEventRepository } from '@/infra/container'
import { success, created, error, unauthorized, serverError } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const session = await getSession(request)
    if (!session) return unauthorized()

    const url = new URL(request.url)
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')
    const limit = url.searchParams.get('limit')

    const repo = getEventRepository()
    const ctx = { tenantId: session.tenantId, userId: session.userId }

    if (start && end) {
      const events = await repo.findByDateRange(ctx, start, end)
      return success(events)
    }

    const events = await repo.findUpcoming(ctx, limit ? parseInt(limit) : 10)
    return success(events)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao listar eventos')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request)
    if (!session) return unauthorized()

    const body = await request.json()
    if (!body.title || !body.start_time) return error('Titulo e horario de inicio sao obrigatorios')

    const repo = getEventRepository()
    const event = await repo.create(
      { tenantId: session.tenantId, userId: session.userId },
      { title: body.title, description: body.description, start_time: body.start_time, end_time: body.end_time, all_day: body.all_day || false, location: body.location, color: body.color, recurrence: body.recurrence }
    )

    return created(event)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao criar evento')
  }
}
