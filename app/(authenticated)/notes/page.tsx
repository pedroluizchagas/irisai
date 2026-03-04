'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type Note = {
  id: string
  title: string
  content: string | null
  tags?: string | null
  is_pinned: boolean
  created_at: string
}

export default function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>([])
  const [loading, setLoading] = React.useState(false)
  const [title, setTitle] = React.useState('')
  const [content, setContent] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/notes?limit=50', { cache: 'no-store' })
      const json = await res.json()
      setNotes(json.data || [])
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
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: content || null }),
      })
      if (res.ok) {
        setTitle('')
        setContent('')
        await load()
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notas</h1>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Input placeholder="Título da nota" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Textarea placeholder="Conteúdo" value={content} onChange={(e) => setContent(e.target.value)} />
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
              <TableHead>Conteúdo</TableHead>
              <TableHead>Criada em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="flex items-center gap-2 p-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : notes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-sm text-muted-foreground">Sem notas</TableCell>
              </TableRow>
            ) : (
              notes.map((n) => (
                <TableRow key={n.id}>
                  <TableCell className="font-medium">{n.title}</TableCell>
                  <TableCell className="truncate max-w-[40ch]">{n.content || '-'}</TableCell>
                  <TableCell>{n.created_at?.split('T')[0]}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
