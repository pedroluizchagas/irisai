 import { getSession } from '@/lib/auth'
 import { success, unauthorized, serverError, error } from '@/lib/api-response'
 import { startLog } from '@/lib/logger'
 import { inc } from '@/lib/metrics'
 import { query } from '@/lib/db'
 
 export async function GET(request: Request) {
   try {
     const log = startLog('api/metrics/aggregate', request)
     const session = await getSession(request)
     if (!session) {
       inc('api/metrics/aggregate', 401)
       log.end(401)
       return unauthorized()
     }
 
     const backend = (process.env.METRICS_BACKEND || '').toLowerCase()
     if (backend !== 'postgres') {
       inc('api/metrics/aggregate', 400)
       log.end(400)
       return error('Persistencia de metricas desativada')
     }
 
     const url = new URL(request.url)
     const route = url.searchParams.get('route') || undefined
     const status = url.searchParams.get('status') || undefined
     const params: unknown[] = []
     let where = ''
     if (route) {
       where += (where ? ' AND' : ' WHERE') + ' route = $' + (params.length + 1)
       params.push(route.trim().toLowerCase())
     }
     if (status) {
       where += (where ? ' AND' : ' WHERE') + ' status = $' + (params.length + 1)
       params.push(String(status))
     }
 
     const sql = `SELECT route, status, count FROM metrics_counters${where} ORDER BY route, status`
     const result = await query(sql, params)
     const rows = result.rows as Array<{ route: string; status: string; count: number }>
     const data: Record<string, Record<string, number>> = {}
     for (const r of rows) {
       if (!data[r.route]) data[r.route] = {}
       data[r.route][r.status] = Number(r.count || 0)
     }
 
     inc('api/metrics/aggregate', 200)
     log.end(200, { userId: session.userId })
     return success({ counters: data })
   } catch (err) {
     const msg = err instanceof Error ? err.message : 'Erro'
     inc('api/metrics/aggregate', 500)
     startLog('api/metrics/aggregate', request).end(500, { error: msg })
     return serverError(msg)
   }
 }
