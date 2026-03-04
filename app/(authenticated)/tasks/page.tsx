 'use client'
 
 import * as React from 'react'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
 import { Card } from '@/components/ui/card'
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
 
 type Task = {
   id: string
   title: string
   description: string | null
   status: 'todo' | 'in_progress' | 'done'
   priority: 'low' | 'medium' | 'high' | 'urgent'
   due_date: string | null
   tags?: string | null
 }
 
 export default function TasksPage() {
   const [tasks, setTasks] = React.useState<Task[]>([])
   const [loading, setLoading] = React.useState(false)
   const [title, setTitle] = React.useState('')
   const [priority, setPriority] = React.useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
   const [dueDate, setDueDate] = React.useState<string>('')
   const [creating, setCreating] = React.useState(false)
 
   async function load() {
     setLoading(true)
     try {
       const res = await fetch('/api/tasks?limit=50', { cache: 'no-store' })
       const json = await res.json()
       setTasks(json.data || [])
     } finally {
       setLoading(false)
     }
   }
 
   React.useEffect(() => {
     load()
   }, [])
 
   async function handleCreate() {
     if (!title.trim()) return
     setCreating(true)
     try {
       const res = await fetch('/api/tasks', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ title, priority, due_date: dueDate || null }),
       })
       if (res.ok) {
         setTitle('')
         setPriority('medium')
         setDueDate('')
         await load()
       }
     } finally {
       setCreating(false)
     }
   }
 
   return (
     <div className="p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold">Tarefas</h1>
       </div>
 
       <Card className="p-4">
         <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
           <div className="md:col-span-2">
             <Input placeholder="Título da tarefa" value={title} onChange={(e) => setTitle(e.target.value)} />
           </div>
           <div>
             <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
               <SelectTrigger>
                 <SelectValue placeholder="Prioridade" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="low">Baixa</SelectItem>
                 <SelectItem value="medium">Média</SelectItem>
                 <SelectItem value="high">Alta</SelectItem>
                 <SelectItem value="urgent">Urgente</SelectItem>
               </SelectContent>
             </Select>
           </div>
           <div>
             <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
           </div>
           <div className="flex items-center">
             <Button disabled={creating || !title.trim()} onClick={handleCreate}>
               {creating ? 'Criando...' : 'Adicionar'}
             </Button>
           </div>
         </div>
       </Card>
 
       <Card className="p-2">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Título</TableHead>
               <TableHead>Status</TableHead>
               <TableHead>Prioridade</TableHead>
               <TableHead>Prazo</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {loading ? (
               <TableRow>
                 <TableCell colSpan={4}>
                   <div className="flex items-center gap-2 p-2">
                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                     <span className="text-sm text-muted-foreground">Carregando...</span>
                   </div>
                 </TableCell>
               </TableRow>
             ) : tasks.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-sm text-muted-foreground">Sem tarefas</TableCell>
               </TableRow>
             ) : (
               tasks.map((t) => (
                 <TableRow key={t.id}>
                   <TableCell className="font-medium">{t.title}</TableCell>
                   <TableCell>
                     {t.status === 'todo' ? 'A fazer' : t.status === 'in_progress' ? 'Em progresso' : 'Concluída'}
                   </TableCell>
                   <TableCell>
                     {t.priority === 'urgent' ? 'Urgente' : t.priority === 'high' ? 'Alta' : t.priority === 'medium' ? 'Média' : 'Baixa'}
                   </TableCell>
                   <TableCell>{t.due_date ? t.due_date.split('T')[0] : '-'}</TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   )
 }
