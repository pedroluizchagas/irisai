// Chat Repository - Infrastructure implementation
import { query } from '@/lib/db'
import { nanoid } from 'nanoid'
import type { ChatMessage, IChatRepository, TenantContext } from '@iris/domain'

export class ChatRepository implements IChatRepository {
  async saveMessage(ctx: TenantContext, data: Pick<ChatMessage, 'role' | 'content' | 'metadata'>): Promise<ChatMessage> {
    const id = nanoid()
    const result = await query(
      `INSERT INTO chat_messages (id, tenant_id, user_id, role, content, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [id, ctx.tenantId, ctx.userId, data.role, data.content, data.metadata || null]
    )
    return this.mapRow(result.rows[0])
  }

  async getHistory(ctx: TenantContext, limit = 50): Promise<ChatMessage[]> {
    const result = await query(
      'SELECT * FROM chat_messages WHERE tenant_id = $1 AND user_id = $2 ORDER BY created_at DESC LIMIT $3',
      [ctx.tenantId, ctx.userId, limit]
    )
    return result.rows.map(this.mapRow).reverse()
  }

  async clearHistory(ctx: TenantContext): Promise<void> {
    await query('DELETE FROM chat_messages WHERE tenant_id = $1 AND user_id = $2', [ctx.tenantId, ctx.userId])
  }

  private mapRow(row: Record<string, unknown>): ChatMessage {
    return {
      id: row.id as string,
      tenant_id: row.tenant_id as string,
      user_id: row.user_id as string,
      role: row.role as ChatMessage['role'],
      content: row.content as string,
      metadata: row.metadata as string | null,
      created_at: new Date(row.created_at as string).toISOString(),
    }
  }
}
