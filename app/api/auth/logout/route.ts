// Auth API - Logout
import { NextResponse } from 'next/server'
import { startLog } from '@/lib/logger'
import { inc } from '@/lib/metrics'

export async function POST(request: Request) {
  const log = startLog('api/auth/logout', request)
  const response = NextResponse.json({ data: { message: 'Logout realizado' } })
  response.headers.set('Set-Cookie', 'iris-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  inc('api/auth/logout', 200)
  log.end(200)
  return response
}
