// Goal & Habit Repositories - Infrastructure implementation
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { Goal, Habit, HabitLog } from '@/core/entities'
import type { IGoalRepository, IHabitRepository, TenantContext, PaginatedResult } from '@/core/repositories'

export class GoalRepository implements IGoalRepository {
  async create(ctx: TenantContext, data: Pick<Goal, 'title' | 'description' | 'target_value' | 'unit' | 'deadline'>): Promise<Goal> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO goals (id, tenant_id, user_id, title, description, target_value, current_value, unit, deadline, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, 'active', NOW(), NOW()) RETURNING *`,
      [id, ctx.tenantId, ctx.userId, data.title, data.description || null, data.target_value || null, data.unit || null, data.deadline || null]
    )
    return this.mapRow(result.rows[0])
  }

  async findById(ctx: TenantContext, id: string): Promise<Goal | null> {
    const result = await query('SELECT * FROM goals WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null
  }

  async findAll(ctx: TenantContext, params?: { page?: number; limit?: number; status?: string }): Promise<PaginatedResult<Goal>> {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const offset = (page - 1) * limit

    let where = 'WHERE tenant_id = $1 AND user_id = $2'
    const qp: unknown[] = [ctx.tenantId, ctx.userId]
    let pi = 3
    if (params?.status) { where += ` AND status = $${pi++}`; qp.push(params.status) }

    const countResult = await query(`SELECT COUNT(*) FROM goals ${where}`, qp)
    const total = parseInt(countResult.rows[0].count, 10)
    const result = await query(`SELECT * FROM goals ${where} ORDER BY created_at DESC LIMIT $${pi++} OFFSET $${pi}`, [...qp, limit, offset])

    return { data: result.rows.map(this.mapRow), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async update(ctx: TenantContext, id: string, data: Partial<Pick<Goal, 'title' | 'description' | 'target_value' | 'current_value' | 'unit' | 'deadline' | 'status'>>): Promise<Goal> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title) }
    if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description) }
    if (data.target_value !== undefined) { fields.push(`target_value = $${i++}`); values.push(data.target_value) }
    if (data.current_value !== undefined) { fields.push(`current_value = $${i++}`); values.push(data.current_value) }
    if (data.unit !== undefined) { fields.push(`unit = $${i++}`); values.push(data.unit) }
    if (data.deadline !== undefined) { fields.push(`deadline = $${i++}`); values.push(data.deadline) }
    if (data.status !== undefined) { fields.push(`status = $${i++}`); values.push(data.status) }
    fields.push(`updated_at = NOW()`)

    const result = await query(`UPDATE goals SET ${fields.join(', ')} WHERE id = $${i++} AND tenant_id = $${i++} AND user_id = $${i} RETURNING *`, [...values, id, ctx.tenantId, ctx.userId])
    if (result.rows.length === 0) throw new Error('Meta nao encontrada')
    return this.mapRow(result.rows[0])
  }

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await query('DELETE FROM goals WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
  }

  private mapRow(row: Record<string, unknown>): Goal {
    return {
      id: row.id as string, tenant_id: row.tenant_id as string, user_id: row.user_id as string,
      title: row.title as string, description: row.description as string | null,
      target_value: row.target_value ? parseFloat(row.target_value as string) : null,
      current_value: parseFloat((row.current_value as string) || '0'),
      unit: row.unit as string | null, deadline: row.deadline ? (row.deadline as string).split('T')[0] : null,
      status: row.status as Goal['status'],
      created_at: new Date(row.created_at as string).toISOString(),
      updated_at: new Date(row.updated_at as string).toISOString(),
    }
  }
}

export class HabitRepository implements IHabitRepository {
  async create(ctx: TenantContext, data: Pick<Habit, 'title' | 'description' | 'frequency' | 'target_count' | 'color'>): Promise<Habit> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO habits (id, tenant_id, user_id, title, description, frequency, target_count, color, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW()) RETURNING *`,
      [id, ctx.tenantId, ctx.userId, data.title, data.description || null, data.frequency || 'daily', data.target_count || 1, data.color || null]
    )
    return this.mapHabit(result.rows[0])
  }

  async findById(ctx: TenantContext, id: string): Promise<Habit | null> {
    const result = await query('SELECT * FROM habits WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
    return result.rows.length > 0 ? this.mapHabit(result.rows[0]) : null
  }

  async findAll(ctx: TenantContext): Promise<Habit[]> {
    const result = await query('SELECT * FROM habits WHERE tenant_id = $1 AND user_id = $2 AND is_active = true ORDER BY created_at', [ctx.tenantId, ctx.userId])
    return result.rows.map(this.mapHabit)
  }

  async update(ctx: TenantContext, id: string, data: Partial<Pick<Habit, 'title' | 'description' | 'frequency' | 'target_count' | 'color' | 'is_active'>>): Promise<Habit> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title) }
    if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description) }
    if (data.frequency !== undefined) { fields.push(`frequency = $${i++}`); values.push(data.frequency) }
    if (data.target_count !== undefined) { fields.push(`target_count = $${i++}`); values.push(data.target_count) }
    if (data.color !== undefined) { fields.push(`color = $${i++}`); values.push(data.color) }
    if (data.is_active !== undefined) { fields.push(`is_active = $${i++}`); values.push(data.is_active) }

    const result = await query(`UPDATE habits SET ${fields.join(', ')} WHERE id = $${i++} AND tenant_id = $${i++} AND user_id = $${i} RETURNING *`, [...values, id, ctx.tenantId, ctx.userId])
    if (result.rows.length === 0) throw new Error('Habito nao encontrado')
    return this.mapHabit(result.rows[0])
  }

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await query('DELETE FROM habit_logs WHERE habit_id = $1 AND tenant_id = $2', [id, ctx.tenantId])
    await query('DELETE FROM habits WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
  }

  async logCompletion(ctx: TenantContext, habitId: string, note?: string): Promise<HabitLog> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO habit_logs (id, habit_id, tenant_id, user_id, completed_at, note) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING *`,
      [id, habitId, ctx.tenantId, ctx.userId, note || null]
    )
    return this.mapLog(result.rows[0])
  }

  async getLogsForDate(ctx: TenantContext, date: string): Promise<HabitLog[]> {
    const result = await query(
      `SELECT * FROM habit_logs WHERE tenant_id = $1 AND user_id = $2 AND completed_at::date = $3::date`,
      [ctx.tenantId, ctx.userId, date]
    )
    return result.rows.map(this.mapLog)
  }

  async getLogsForRange(ctx: TenantContext, habitId: string, start: string, end: string): Promise<HabitLog[]> {
    const result = await query(
      `SELECT * FROM habit_logs WHERE habit_id = $1 AND tenant_id = $2 AND user_id = $3 AND completed_at >= $4 AND completed_at <= $5 ORDER BY completed_at`,
      [habitId, ctx.tenantId, ctx.userId, start, end]
    )
    return result.rows.map(this.mapLog)
  }

  private mapHabit(row: Record<string, unknown>): Habit {
    return {
      id: row.id as string, tenant_id: row.tenant_id as string, user_id: row.user_id as string,
      title: row.title as string, description: row.description as string | null,
      frequency: row.frequency as Habit['frequency'], target_count: parseInt(row.target_count as string, 10),
      color: row.color as string | null, is_active: row.is_active as boolean,
      created_at: new Date(row.created_at as string).toISOString(),
    }
  }

  private mapLog(row: Record<string, unknown>): HabitLog {
    return {
      id: row.id as string, habit_id: row.habit_id as string,
      tenant_id: row.tenant_id as string, user_id: row.user_id as string,
      completed_at: new Date(row.completed_at as string).toISOString(),
      note: row.note as string | null,
    }
  }
}
