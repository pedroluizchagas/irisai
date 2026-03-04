 'use client'
 
 import * as React from 'react'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { Card } from '@/components/ui/card'
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
 import { Switch } from '@/components/ui/switch'
 
 type Event = {
   id: string
   title: string
   description: string | null
   start_time: string
   end_time: string | null
   all_day: boolean
   location: string | null
   color: string | null
   recurrence: string | null
 }
 
 export default function CalendarPage() {
   const [events, setEvents] = React.useState<Event[]>([])
   const [loading, setLoading] = React.useState(false)
   const [creating, setCreating] = React.useState(false)
   const [title, setTitle] = React.useState('')
   const [startTime, setStartTime] = React.useState('')
   const [endTime, setEndTime] = React.useState('')
   const [location, setLocation] = React.useState('')
   const [allDay, setAllDay] = React.useState(false)
 
   async function load() {
     setLoading(true)
     try {
       const res = await fetch('/api/events?limit=50', { cache: 'no-store' })
       const json = await res.json()
       setEvents(json.data || [])
     } finally {
       setLoading(false)
     }
   }
 
   React.useEffect(() => {
     load()
   }, [])
 
   async function handleCreate() {
     if (!title.trim() || (!allDay && !startTime)) return
     setCreating(true)
     try {
       const res = await fetch('/api/events', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           title,
           start_time: allDay ? new Date().toISOString() : new Date(startTime).toISOString(),
           end_time: endTime ? new Date(endTime).toISOString() : null,
           all_day: allDay,
           location: location || null,
         }),
       })
       if (res.ok) {
         setTitle('')
         setStartTime('')
         setEndTime('')
         setLocation('')
         setAllDay(false)
         await load()
       }
     } finally {
       setCreating(false)
     }
   }
 
   return (
     <div className="p-6 space-y-4">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold">Agenda</h1>
         <div className="text-sm text-muted-foreground">Lista de eventos e criação rápida</div>
       </div>
 
       <Card className="p-4 space-y-3">
         <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
           <Input
             placeholder="Título do evento"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
           />
           <div className="flex items-center gap-3">
             <span className="text-sm text-muted-foreground">Dia todo</span>
             <Switch checked={allDay} onCheckedChange={(v) => setAllDay(Boolean(v))} />
           </div>
           <Input
             type="datetime-local"
             placeholder="Início"
             value={startTime}
             onChange={(e) => setStartTime(e.target.value)}
             disabled={allDay}
           />
           <Input
             type="datetime-local"
             placeholder="Fim (opcional)"
             value={endTime}
             onChange={(e) => setEndTime(e.target.value)}
             disabled={allDay}
           />
           <Input
             placeholder="Local (opcional)"
             value={location}
             onChange={(e) => setLocation(e.target.value)}
           />
         </div>
         <div className="flex justify-end">
           <Button onClick={handleCreate} disabled={creating}>
             {creating ? 'Criando...' : 'Criar evento'}
           </Button>
         </div>
       </Card>
 
       <Card className="p-0">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Título</TableHead>
               <TableHead>Início</TableHead>
               <TableHead>Fim</TableHead>
               <TableHead>Local</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {loading ? (
               <TableRow>
                 <TableCell colSpan={4}>
                   <div className="flex items-center gap-2 p-3">
                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                     <span className="text-sm text-muted-foreground">Carregando...</span>
                   </div>
                 </TableCell>
               </TableRow>
             ) : events.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-sm text-muted-foreground">Sem eventos</TableCell>
               </TableRow>
             ) : (
               events.map((e) => (
                 <TableRow key={e.id}>
                   <TableCell className="font-medium">{e.title}</TableCell>
                   <TableCell>{e.start_time ? new Date(e.start_time).toLocaleString() : '-'}</TableCell>
                   <TableCell>{e.end_time ? new Date(e.end_time).toLocaleString() : '-'}</TableCell>
                   <TableCell>{e.location || '-'}</TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   )
 }
