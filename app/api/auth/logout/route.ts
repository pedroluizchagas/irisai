// Auth API - Logout
import { NextResponse } from 'next/server'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'
import { success } from '@/lib/api-response'

export async function POST(request: Request) {
  const log = startLog('api/auth/logout', request)
  const response = success({ message: 'Logout realizado' })
  const url = new URL(request.url)
  const secureFlag = url.protocol === 'https:' || process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const cookies = [
    `iris-token=; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=0`,
    `iris-refresh=; Path=/; HttpOnly; SameSite=Strict${secureFlag}; Max-Age=0`
  ]
  response.headers.set('Set-Cookie', cookies.join(', '))
  inc('api/auth/logout', 200)
  log.end(200)
  return response
}
