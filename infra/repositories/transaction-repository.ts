// Transaction Repository - Infrastructure implementation
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { Transaction, ITransactionRepository, TenantContext, PaginatedResult } from '@iris/domain'

export class TransactionRepository implements ITransactionRepository {
  async create(ctx: TenantContext, data: Pick<Transaction, 'type' | 'amount' | 'currency' | 'category' | 'description' | 'date' | 'is_recurring' | 'recurrence_interval'>): Promise<Transaction> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO transactions (id, tenant_id, user_id, type, amount, currency, category, description, date, is_recurring, recurrence_interval, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
      [id, ctx.tenantId, ctx.userId, data.type, data.amount, data.currency || 'BRL', data.category, data.description || null, data.date, data.is_recurring || false, data.recurrence_interval || null]
    )
    return this.mapRow(result.rows[0])
  }

  async findById(ctx: TenantContext, id: string): Promise<Transaction | null> {
    const result = await query('SELECT * FROM transactions WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null
  }

  async findAll(ctx: TenantContext, params?: { page?: number; limit?: number; type?: string; category?: string; startDate?: string; endDate?: string }): Promise<PaginatedResult<Transaction>> {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const offset = (page - 1) * limit

    let where = 'WHERE tenant_id = $1 AND user_id = $2'
    const qp: unknown[] = [ctx.tenantId, ctx.userId]
    let pi = 3

    if (params?.type) { where += ` AND type = $${pi++}`; qp.push(params.type) }
    if (params?.category) { where += ` AND category = $${pi++}`; qp.push(params.category) }
    if (params?.startDate) { where += ` AND date >= $${pi++}`; qp.push(params.startDate) }
    if (params?.endDate) { where += ` AND date <= $${pi++}`; qp.push(params.endDate) }

    const countResult = await query(`SELECT COUNT(*) FROM transactions ${where}`, qp)
    const total = parseInt(countResult.rows[0].count, 10)

    const result = await query(
      `SELECT * FROM transactions ${where} ORDER BY date DESC, created_at DESC LIMIT $${pi++} OFFSET $${pi}`,
      [...qp, limit, offset]
    )

    return {
      data: result.rows.map(this.mapRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async update(ctx: TenantContext, id: string, data: Partial<Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date'>>): Promise<Transaction> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.type !== undefined) { fields.push(`type = $${i++}`); values.push(data.type) }
    if (data.amount !== undefined) { fields.push(`amount = $${i++}`); values.push(data.amount) }
    if (data.category !== undefined) { fields.push(`category = $${i++}`); values.push(data.category) }
    if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description) }
    if (data.date !== undefined) { fields.push(`date = $${i++}`); values.push(data.date) }

    const result = await query(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = $${i++} AND tenant_id = $${i++} AND user_id = $${i} RETURNING *`,
      [...values, id, ctx.tenantId, ctx.userId]
    )
    if (result.rows.length === 0) throw new Error('Transacao nao encontrada')
    return this.mapRow(result.rows[0])
  }

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await query('DELETE FROM transactions WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
  }

  async getSummary(ctx: TenantContext, month?: string): Promise<{ income: number; expense: number; balance: number }> {
    let where = 'WHERE tenant_id = $1 AND user_id = $2'
    const qp: unknown[] = [ctx.tenantId, ctx.userId]

    if (month) {
      where += ` AND date >= $3 AND date < ($3::date + interval '1 month')`
      qp.push(month + '-01')
    }

    const result = await query(
      `SELECT type, COALESCE(SUM(amount), 0) as total FROM transactions ${where} GROUP BY type`,
      qp
    )

    let income = 0, expense = 0
    result.rows.forEach((row: { type: string; total: string }) => {
      if (row.type === 'income') income = parseFloat(row.total)
      if (row.type === 'expense') expense = parseFloat(row.total)
    })

    return { income, expense, balance: income - expense }
  }

  private mapRow(row: Record<string, unknown>): Transaction {
    return {
      id: row.id as string,
      tenant_id: row.tenant_id as string,
      user_id: row.user_id as string,
      type: row.type as Transaction['type'],
      amount: parseFloat(row.amount as string),
      currency: row.currency as string,
      category: row.category as string,
      description: row.description as string | null,
      date: (row.date as string).split('T')[0],
      is_recurring: row.is_recurring as boolean,
      recurrence_interval: row.recurrence_interval as string | null,
      created_at: new Date(row.created_at as string).toISOString(),
    }
  }
}
