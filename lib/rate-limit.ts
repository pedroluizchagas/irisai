const store = new Map<string, { windowStart: number; count: number }>()

function getIp(request: Request): string {
  const h = request.headers
  const xff = h.get('x-forwarded-for') || ''
  const ip = xff.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  return ip
}

export function checkRateLimit(request: Request, keyPrefix: string, limit: number, windowMs: number) {
  const ip = getIp(request)
  const key = `${keyPrefix}:${ip}`
  const now = Date.now()
  const current = store.get(key)
  if (!current || now - current.windowStart >= windowMs) {
    store.set(key, { windowStart: now, count: 1 })
    return { ok: true, remaining: limit - 1, resetMs: windowMs, key }
  }
  if (current.count < limit) {
    current.count += 1
    store.set(key, current)
    return { ok: true, remaining: limit - current.count, resetMs: current.windowStart + windowMs - now, key }
  }
  return { ok: false, remaining: 0, resetMs: current.windowStart + windowMs - now, key }
}
