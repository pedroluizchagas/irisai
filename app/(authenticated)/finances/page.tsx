 'use client'
 
 import * as React from 'react'
 import { Button } from '@/components/ui/button'
 import { Input } from '@/components/ui/input'
 import { Card } from '@/components/ui/card'
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
 
 type Transaction = {
   id: string
   type: 'income' | 'expense'
   amount: number
   currency: string
   category: string
   description: string | null
   date: string
 }
 
 type Meta = { total: number; page: number; limit: number; totalPages: number }
 
 export default function FinancesPage() {
   const [items, setItems] = React.useState<Transaction[]>([])
   const [meta, setMeta] = React.useState<Meta | null>(null)
   const [loading, setLoading] = React.useState(false)
   const [creating, setCreating] = React.useState(false)
 
   const [type, setType] = React.useState<'income' | 'expense'>('expense')
   const [amount, setAmount] = React.useState<string>('')
   const [category, setCategory] = React.useState<string>('')
   const [description, setDescription] = React.useState<string>('')
   const [date, setDate] = React.useState<string>('')
 
   async function load(page = 1) {
     setLoading(true)
     try {
       const res = await fetch(`/api/transactions?page=${page}&limit=50`, { cache: 'no-store' })
       const json = await res.json()
       setItems(json.data || [])
       setMeta(json.meta || null)
     } finally {
       setLoading(false)
     }
   }
 
   React.useEffect(() => {
     load()
   }, [])
 
   async function handleCreate() {
     if (!amount || !category.trim() || !date) return
     setCreating(true)
     try {
       const res = await fetch('/api/transactions', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           type,
           amount: parseFloat(amount),
           category,
           description: description || null,
           date,
         }),
       })
       if (res.ok) {
         setType('expense')
         setAmount('')
         setCategory('')
         setDescription('')
         setDate('')
         await load()
       }
     } finally {
       setCreating(false)
     }
   }
 
   return (
     <div className="p-6 space-y-4">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold">Finanças</h1>
         <div className="text-sm text-muted-foreground">Lançamentos e criação rápida</div>
       </div>
 
       <Card className="p-4 space-y-3">
         <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
           <Select value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
             <SelectTrigger>
               <SelectValue placeholder="Tipo" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="income">Receita</SelectItem>
               <SelectItem value="expense">Despesa</SelectItem>
             </SelectContent>
           </Select>
           <Input
             type="number"
             step="0.01"
             placeholder="Valor"
             value={amount}
             onChange={(e) => setAmount(e.target.value)}
           />
           <Input
             placeholder="Categoria"
             value={category}
             onChange={(e) => setCategory(e.target.value)}
           />
           <Input
             placeholder="Descrição (opcional)"
             value={description}
             onChange={(e) => setDescription(e.target.value)}
           />
           <Input
             type="date"
             placeholder="Data"
             value={date}
             onChange={(e) => setDate(e.target.value)}
           />
         </div>
         <div className="flex justify-end">
           <Button onClick={handleCreate} disabled={creating}>
             {creating ? 'Criando...' : 'Adicionar lançamento'}
           </Button>
         </div>
       </Card>
 
       <Card className="p-0">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead>Tipo</TableHead>
               <TableHead>Valor</TableHead>
               <TableHead>Categoria</TableHead>
               <TableHead>Data</TableHead>
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
             ) : items.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={4} className="text-sm text-muted-foreground">Sem lançamentos</TableCell>
               </TableRow>
             ) : (
               items.map((t) => (
                 <TableRow key={t.id}>
                   <TableCell>{t.type === 'income' ? 'Receita' : 'Despesa'}</TableCell>
                   <TableCell>
                     {(t.amount ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: t.currency || 'BRL' })}
                   </TableCell>
                   <TableCell>{t.category}</TableCell>
                   <TableCell>{t.date ? t.date.split('T')[0] : '-'}</TableCell>
                 </TableRow>
               ))
             )}
           </TableBody>
         </Table>
       </Card>
     </div>
   )
 }
