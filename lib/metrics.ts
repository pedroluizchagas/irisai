const counters: Record<string, Record<string, number>> = {}
let started = false
let tableReady = false
const persistEnabled = (process.env.METRICS_BACKEND || '').toLowerCase() === 'postgres'

function key(route: string) {
  return route.trim().toLowerCase()
}

export function inc(route: string, status: number) {
  const r = key(route)
  const s = String(status)
  if (!counters[r]) counters[r] = {}
  counters[r][s] = (counters[r][s] || 0) + 1
  if (persistEnabled) {
    ensureTable().then(() => {
      void (async () => {
        const { query } = await import('@/lib/db')
        await query(
        'INSERT INTO metrics_counters(route, status, count) VALUES($1, $2, 1) ON CONFLICT (route, status) DO UPDATE SET count = metrics_counters.count + 1',
        [r, s],
        )
      })()
    }).catch(() => {})
  }
}

export function snapshot() {
  const out: Record<string, Record<string, number>> = {}
  for (const r of Object.keys(counters)) {
    out[r] = { ...counters[r] }
  }
  return out
}

function start() {
  if (started) return
  started = true
  if (process.env.NODE_ENV === 'development') {
    const t = setInterval(() => {
      const data = snapshot()
      console.log(JSON.stringify({ type: 'metrics', data, ts: new Date().toISOString() }))
    }, 30000) as unknown as { unref?: () => void }
    t.unref?.()
  }
}

start()

async function ensureTable() {
  if (tableReady) return
  const { query } = await import('@/lib/db')
  await query('CREATE TABLE IF NOT EXISTS metrics_counters(route TEXT NOT NULL, status TEXT NOT NULL, count BIGINT NOT NULL DEFAULT 0, PRIMARY KEY(route, status))')
  tableReady = true
}
