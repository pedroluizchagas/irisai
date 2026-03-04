import Link from 'next/link'
import { headers } from 'next/headers'

async function getDashboard() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/dashboard`, { cache: 'no-store' })
  if (!res.ok) return null
  const json = await res.json()
  return json.data
}

export default async function DashboardPage() {
  const data = await getDashboard()
  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Não foi possível carregar os dados.</p>
      </div>
    )
  }

  const tasks = data.tasks || {}
  const events = data.events || []
  const finance = data.finance || { income: 0, expense: 0, balance: 0 }
  const habits = data.habits || { total: 0, completedToday: 0, items: [] }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Olá, {data.userName}</h1>
        <div className="flex gap-2">
          <Link href="/tasks" className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">Ver tarefas</Link>
          <Link href="/dashboard/chat" className="rounded-md border px-3 py-2 text-sm">Abrir chat</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Tarefas a fazer</p>
          <p className="mt-1 text-2xl font-bold">{tasks.todo ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Em progresso</p>
          <p className="mt-1 text-2xl font-bold">{tasks.in_progress ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Concluídas</p>
          <p className="mt-1 text-2xl font-bold">{tasks.done ?? 0}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={finance.balance >= 0 ? 'mt-1 text-2xl font-bold text-emerald-600' : 'mt-1 text-2xl font-bold text-red-600'}>
            R$ {finance.balance?.toFixed(2) ?? '0.00'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Próximos eventos</h2>
            <Link href="/events" className="text-sm text-muted-foreground hover:underline">Ver todos</Link>
          </div>
          <div className="mt-3 space-y-2">
            {events.length === 0 && <p className="text-sm text-muted-foreground">Sem eventos próximos.</p>}
            {events.slice(0, 5).map((e: any) => (
              <div key={e.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.start_time?.split('T')[0]} {e.location ? `• ${e.location}` : ''}</p>
                </div>
                <Link href={`/events/${e.id}`} className="text-xs text-primary hover:underline">Detalhes</Link>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Hábitos de hoje</h2>
            <Link href="/goals" className="text-sm text-muted-foreground hover:underline">Metas</Link>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {habits.completedToday ?? 0} de {habits.total ?? 0} concluídos
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2">
            {(habits.items || []).slice(0, 6).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <p className="text-sm font-medium">{h.title}</p>
                <Link href={`/habits/${h.id}`} className="text-xs text-primary hover:underline">Abrir</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
