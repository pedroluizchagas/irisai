// Note Repository - Infrastructure implementation
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { Note, INoteRepository, TenantContext, PaginatedResult } from '@iris/domain'

export class NoteRepository implements INoteRepository {
  async create(ctx: TenantContext, data: Pick<Note, 'title' | 'content' | 'tags' | 'is_pinned'>): Promise<Note> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO notes (id, tenant_id, user_id, title, content, tags, is_pinned, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
      [id, ctx.tenantId, ctx.userId, data.title, data.content || null, data.tags || null, data.is_pinned || false]
    )
    return this.mapRow(result.rows[0])
  }

  async findById(ctx: TenantContext, id: string): Promise<Note | null> {
    const result = await query('SELECT * FROM notes WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
    return result.rows.length > 0 ? this.mapRow(result.rows[0]) : null
  }

  async findAll(ctx: TenantContext, params?: { page?: number; limit?: number }): Promise<PaginatedResult<Note>> {
    const page = params?.page || 1
    const limit = params?.limit || 20
    const offset = (page - 1) * limit

    const countResult = await query('SELECT COUNT(*) FROM notes WHERE tenant_id = $1 AND user_id = $2', [ctx.tenantId, ctx.userId])
    const total = parseInt(countResult.rows[0].count, 10)

    const result = await query(
      'SELECT * FROM notes WHERE tenant_id = $1 AND user_id = $2 ORDER BY is_pinned DESC, updated_at DESC LIMIT $3 OFFSET $4',
      [ctx.tenantId, ctx.userId, limit, offset]
    )

    return {
      data: result.rows.map(this.mapRow),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async update(ctx: TenantContext, id: string, data: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'is_pinned'>>): Promise<Note> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.title !== undefined) { fields.push(`title = $${i++}`); values.push(data.title) }
    if (data.content !== undefined) { fields.push(`content = $${i++}`); values.push(data.content) }
    if (data.tags !== undefined) { fields.push(`tags = $${i++}`); values.push(data.tags) }
    if (data.is_pinned !== undefined) { fields.push(`is_pinned = $${i++}`); values.push(data.is_pinned) }
    fields.push(`updated_at = NOW()`)

    const result = await query(
      `UPDATE notes SET ${fields.join(', ')} WHERE id = $${i++} AND tenant_id = $${i++} AND user_id = $${i} RETURNING *`,
      [...values, id, ctx.tenantId, ctx.userId]
    )
    if (result.rows.length === 0) throw new Error('Nota nao encontrada')
    return this.mapRow(result.rows[0])
  }

  async delete(ctx: TenantContext, id: string): Promise<void> {
    await query('DELETE FROM notes WHERE id = $1 AND tenant_id = $2 AND user_id = $3', [id, ctx.tenantId, ctx.userId])
  }

  private mapRow(row: Record<string, unknown>): Note {
    return {
      id: row.id as string,
      tenant_id: row.tenant_id as string,
      user_id: row.user_id as string,
      title: row.title as string,
      content: row.content as string | null,
      tags: row.tags as string | null,
      is_pinned: row.is_pinned as boolean,
      created_at: new Date(row.created_at as string).toISOString(),
      updated_at: new Date(row.updated_at as string).toISOString(),
    }
  }
}
