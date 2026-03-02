// Task Repository - Infrastructure implementation
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { Task } from '@/core/entities'
import type { ITaskRepository, TenantContext, PaginatedResult } from '@/core/repositories'

export class TaskRepository implements ITaskRepository {
  async create(ctx: TenantContext, data: Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'tags'>): Promise<Task> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO tasks (id, tenant_id, user_id, title, description, status, priority, due_date, tags, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *`,
      [id, ctx.tenantId, ctx.userId, data.title, data.description || null, data.status || 'todo', data.priority || 'medium', data.due_date || null, data.tags || null]
    )
    return this.mapRow(result.rows[0])
  }

  async findById(ctx: TenantContext, id: string): Promise<Task | null> {
    const result = await query(
      'SELECT * FROM tasks WHERE id = $1 AND tenant_id = $2 AND user_id = $3',
      [id, ctx.tenantId, ctx.userId]
    )
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null
  }

  async findAll(ctx: TenantContext, params?: { page?: number; limit?: number; status?: string; priority?: string }): Promise<PaginatedResult<Task>> {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const offset = (page - 1) * limit

    let whereClause = 'WHERE tenant_id = $1 AND user_id = $2'
    const queryParams: unknown[] = [ctx.tenantId, ctx.userId]
    let paramIndex = 3

    if (params?.status) {
      whereClause += ` AND status = $${paramIndex++}`
      queryParams.push(params.status)
    }
    if (params?.priority) {
      whereClause += ` AND priority = $${paramIndex++}`
      queryParams.push(params.priority)
    }

    const countResult = await query(`SELECT COUNT(*) FROM tasks ${whereClause}`, queryParams)
    const total = parseInt(countResult.rows[0].count, 10)

    const result = await query(
      `SELECT * FROM tasks ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...queryParams, limit, offset]
    )

    return {
      data: result.rows.map(this.mapRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async update(ctx: TenantContext, id: string, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'tags'>>): Promise<Task> {
    const fields: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (data.title !== undefined) { fields.push(`title = $${paramIndex++}`); values.push(data.title) }
    if (data.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(data.description) }
    if (data.status !== undefined) { fields.push(`status = $${paramIndex++}`); values.push(data.status) }
    if (data.priority !== undefined) { fields.push(`priority = $${paramIndex++}`); values.push(data.priority) }
    if (data.due_date !== undefined) { fields.push(`due_date = $${paramIndex++}`); values.push(data.due_date) }
    if (data.tags !== undefined) { fields.push(`tags = $${paramIndex++}`); values.push(data.tags) }

    fields.push(`updated_at = NOW()`)

    const result = await query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
      [...values, id, ctx.tenantId, ctx.userId]
    )

    if (result.rows.length === 0) throw new Error('Tarefa nao encontrada')
    return this.mapRow(result.rows[0])
  }

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await query('DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
  }

  async countByStatus(ctx: TenantContext): Promise<Record<string, number>> {
    const result = await query(
      'SELECT status, COUNT(*) as count FROM tasks WHERE tenant_id = $1 AND user_id = $2 GROUP BY status',
      [ctx.tenantId, ctx.userId]
    )
    const counts: Record<string, number> = { todo: 0, in_progress: 0, done: 0 }
    result.rows.forEach((row: { status: string; count: string }) => {
      counts[row.status] = parseInt(row.count, 10)
    })
    return counts
  }

  private mapRow(row: Record<string, unknown>): Task {
    return {
      id: row.id as string,
      tenant_id: row.tenant_id as string,
      user_id: row.user_id as string,
      title: row.title as string,
      description: row.description as string | null,
      status: row.status as Task['status'],
      priority: row.priority as Task['priority'],
      due_date: row.due_date ? new Date(row.due_date as string).toISOString() : null,
      tags: row.tags as string | null,
      created_at: new Date(row.created_at as string).toISOString(),
      updated_at: new Date(row.updated_at as string).toISOString(),
    }
  }
}
