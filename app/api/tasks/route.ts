// Tasks API - List + Create
import { getSession } from '@/lib/auth'
import { getTaskRepository } from '@/infra/container'
import { success, created, error, unauthorized, serverError } from '@/lib/api-response'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function GET(request: Request) {
  try {
    const log = startLog('api/tasks', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/tasks', 401)
      log.end(401)
      return unauthorized()
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status') || undefined
    const priority = url.searchParams.get('priority') || undefined

    const repo = getTaskRepository()
    const result = await repo.findAll(
      { tenantId: session.tenantId, userId: session.userId },
      { page, limit, status, priority }
    )

    inc('api/tasks', 200)
    log.end(200, { userId: session.userId })
    return success(result.data, result.meta)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao listar tarefas'
    inc('api/tasks', 500)
    startLog('api/tasks', request).end(500, { error: msg })
    return serverError(msg)
  }
}

export async function POST(request: Request) {
  try {
    const log = startLog('api/tasks', request)
    const session = await getSession(request)
    if (!session) {
      inc('api/tasks', 401)
      log.end(401)
      return unauthorized()
    }

    const body = await request.json()
    if (!body.title) {
      inc('api/tasks', 400)
      log.end(400)
      return error('Titulo e obrigatorio')
    }

    const repo = getTaskRepository()
    const task = await repo.create(
      { tenantId: session.tenantId, userId: session.userId },
      { title: body.title, description: body.description, status: body.status || 'todo', priority: body.priority || 'medium', due_date: body.due_date, tags: body.tags }
    )

    inc('api/tasks', 201)
    log.end(201, { userId: session.userId })
    return created(task)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao criar tarefa'
    inc('api/tasks', 500)
    startLog('api/tasks', request).end(500, { error: msg })
    return serverError(msg)
  }
}
