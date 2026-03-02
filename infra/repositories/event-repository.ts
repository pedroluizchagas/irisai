// Event Repository - Infrastructure implementation
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { Event } from '@/core/entities'
import type { IEventRepository, TenantContext } from '@/core/repositories'

export class EventRepository implements IEventRepository {
  async create(ctx: TenantContext, data: Pick<Event, 'title' | 'description' | 'start_time' | 'end_time' | 'all_day' | 'location' | 'color' | 'recurrence'>): Promise<Event> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO events (id, tenant_id, user_id, title, description, start_time, end_time, all_day, location, color, recurrence, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
      [id, ctx.tenantId, ctx.userId, data.title, data.description || null, data.start_time, data.end_time || null, data.all_day || false, data.location || null, data.color || null, data.recurrence || null]
    )
    return this.mapRow(result.rows[0])
  }

  async findById(ctx: TenantContext, id: string): Promise<Event | null> {
    const result = await query('SELECT * FROM events WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null
  }

  async findByDateRange(ctx: TenantContext, start: string, end: string): Promise<Event[]> {
    const result = await query(
      'SELECT * FROM events WHERE tenant_id = $1 AND user_id = $2 AND start_time >= $3 AND start_time <= $4 ORDER BY start_time',
      [ctx.tenantId, ctx.userId, start, end]
    )
    return result.rows.map(this.mapRow)
  }

  async findUpcoming(ctx: TenantContext, limit = 5): Promise<Event[]> {
    const result = await query(
      'SELECT * FROM events WHERE tenant_id = $1 AND user_id = $2 AND start_time >= NOW() ORDER BY start_time LIMIT $3',
      [ctx.tenantId, ctx.userId, limit]
    )
    return result.rows.map(this.mapRow)
  }

  async update(ctx: TenantContext, id: string, data: Partial<Pick<Event, 'title' | 'description' | 'start_time' | 'end_time' | 'all_day' | 'location' | 'color' | 'recurrence'>>): Promise<Event> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title) }
    if (data.description !== undefined) { fields.push(`description = $${i++}`); values.push(data.description) }
    if (data.start_time !== undefined) { fields.push(`start_time = $${i++}`); values.push(data.start_time) }
    if (data.end_time !== undefined) { fields.push(`end_time = $${i++}`); values.push(data.end_time) }
    if (data.all_day !== undefined) { fields.push(`all_day = $${i++}`); values.push(data.all_day) }
    if (data.location !== undefined) { fields.push(`location = $${i++}`); values.push(data.location) }
    if (data.color !== undefined) { fields.push(`color = $${i++}`); values.push(data.color) }
    if (data.recurrence !== undefined) { fields.push(`recurrence = $${i++}`); values.push(data.recurrence) }

    const result = await query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${i++} AND tenant_id = $${i++} AND user_id = $${i} RETURNING *`,
      [...values, id, ctx.tenantId, ctx.userId]
    )
    if (result.rows.length === 0) throw new Error('Evento nao encontrado')
    return this.mapRow(result.rows[0])
  }

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await query('DELETE FROM events WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
  }

  private mapRow(row: Record<string, unknown>): Event {
    return {
      id: row.id as string,
      tenant_id: row.tenant_id as string,
      user_id: row.user_id as string,
      title: row.title as string,
      description: row.description as string | null,
      start_time: new Date(row.start_time as string).toISOString(),
      end_time: row.end_time ? new Date(row.end_time as string).toISOString() : null,
      all_day: row.all_day as boolean,
      location: row.location as string | null,
      color: row.color as string | null,
      recurrence: row.recurrence as string | null,
      created_at: new Date(row.created_at as string).toISOString(),
    }
  }
}
