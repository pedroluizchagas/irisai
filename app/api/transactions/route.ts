// Transactions API - List + Create
import { getSession } from '@/lib/auth'
import { getTransactionRepository } from '@/infra/container'
import { success, created, error, unauthorized, serverError } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const session = await getSession(request)
    if (!session) return unauthorized()
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const type = url.searchParams.get('type') || undefined
    const category = url.searchParams.get('category') || undefined
    const startDate = url.searchParams.get('startDate') || undefined
    const endDate = url.searchParams.get('endDate') || undefined
    const repo = getTransactionRepository()
    const result = await repo.findAll({ tenantId: session.tenantId, userId: session.userId }, { page, limit, type, category, startDate, endDate })
    return success(result.data, result.meta)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao listar transacoes')
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession(request)
    if (!session) return unauthorized()
    const body = await request.json()
    if (!body.type || !body.amount || !body.category || !body.date) return error('Tipo, valor, categoria e data sao obrigatorios')
    const repo = getTransactionRepository()
    const txn = await repo.create({ tenantId: session.tenantId, userId: session.userId }, {
      type: body.type, amount: body.amount, currency: body.currency || 'BRL', category: body.category, description: body.description, date: body.date, is_recurring: body.is_recurring || false, recurrence_interval: body.recurrence_interval
    })
    return created(txn)
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro ao criar transacao')
  }
}
