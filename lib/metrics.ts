const counters: Record<string, Record<string, number>> = {}
let started = false

function key(route: string) {
  return route.trim().toLowerCase()
}

export function inc(route: string, status: number) {
  const r = key(route)
  const s = String(status)
  if (!counters[r]) counters[r] = {}
  counters[r][s] = (counters[r][s] || 0) + 1
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
