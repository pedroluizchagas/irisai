import { nanoid } from 'nanoid'
import * as Sentry from '@sentry/nextjs'

let sentryStarted = false
function initSentry() {
  if (sentryStarted) return
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (dsn) {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      enableTracing: true,
      environment: process.env.NODE_ENV || 'development',
    })
    sentryStarted = true
  }
}

function getIp(request: Request): string {
  const h = request.headers
  const xff = h.get('x-forwarded-for') || ''
  const ip = xff.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  return ip
}

export function startLog(route: string, request: Request, meta?: Record<string, unknown>) {
  initSentry()
  const start = Date.now()
  const id = nanoid()
  const ip = getIp(request)
  const ua = request.headers.get('user-agent') || ''
  return {
    end: (status: number, extra?: Record<string, unknown>) => {
      const duration = Date.now() - start
      const payload = {
        id,
        route,
        status,
        duration_ms: duration,
        ip,
        ua,
        meta: meta || {},
        extra: extra || {},
        ts: new Date().toISOString(),
      }
      console.log(JSON.stringify(payload))
      if (status >= 500) {
        Sentry.captureMessage(`API error on ${route}`, {
          level: 'error',
          extra: payload,
        })
      }
    },
  }
}
