import { api } from '../lib/http'
import type { Task, Event, Note, Transaction } from '@iris/domain'

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

export async function listTasks(params?: { page?: number; limit?: number; status?: string; priority?: string }) {
  const res = await api.get<ApiResponse<Task[]>>('/api/tasks', { params })
  return res.data
}

export async function createTask(data: Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'tags'>) {
  const res = await api.post<ApiResponse<Task>>('/api/tasks', data)
  return res.data
}

export async function listEvents(params?: { start?: string; end?: string; limit?: number }) {
  const res = await api.get<ApiResponse<Event[]>>('/api/events', { params })
  return res.data
}

export async function createEvent(data: Pick<Event, 'title' | 'description' | 'start_time' | 'end_time' | 'all_day' | 'location' | 'color' | 'recurrence'>) {
  const res = await api.post<ApiResponse<Event>>('/api/events', data)
  return res.data
}

export async function createNote(data: Pick<Note, 'title' | 'content' | 'tags' | 'is_pinned'>) {
  const res = await api.post<ApiResponse<Note>>('/api/notes', data)
  return res.data
}

export async function addTransaction(data: Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date'>) {
  const res = await api.post<ApiResponse<Transaction>>('/api/transactions', data)
  return res.data
}
