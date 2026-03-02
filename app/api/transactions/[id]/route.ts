// Transactions API - Get / Update / Delete by ID
import { getSession } from '@/lib/auth'
import { getTransactionRepository } from '@/infra/container'
import { success, unauthorized, notFound, serverError } from '@/lib/api-response'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request)
    if (!session) return unauthorized()
    const { id } = await params
    const body = await request.json()
    const repo = getTransactionRepository()
    const txn = await repo.update({ tenantId: session.tenantId, userId: session.userId }, id, body)
    return success(txn)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro'
    if (msg.includes('nao encontrada')) return notFound(msg)
    return serverError(msg)
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(request)
    if (!session) return unauthorized()
    const { id } = await params
    const repo = getTransactionRepository()
    await repo.delete({ tenantId: session.tenantId, userId: session.userId }, id)
    return success({ deleted: true })
  } catch (err) {
    return serverError(err instanceof Error ? err.message : 'Erro')
  }
}
