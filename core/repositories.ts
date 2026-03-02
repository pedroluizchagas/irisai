// Repository Interfaces - Clean Architecture (Interface Segregation Principle)
// These define the contracts that infrastructure must implement

import type { Task, Event, Note, Transaction, Goal, Habit, HabitLog, ChatMessage, User, Tenant } from './entities'

// Base context for multi-tenant queries
export interface TenantContext {
  tenantId: string
  userId: string
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// --- Tenant Repository ---
export interface ITenantRepository {
  create(data: Pick<Tenant, 'name' | 'slug' | 'plan'>): Promise<Tenant>
  findById(id: string): Promise<Tenant | null>
  findBySlug(slug: string): Promise<Tenant | null>
}

// --- User Repository ---
export interface IUserRepository {
  create(data: Omit<User, 'id' | 'created_at'>): Promise<User>
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByTenant(tenantId: string): Promise<User[]>
  update(id: string, data: Partial<Pick<User, 'name' | 'avatar_url' | 'role'>>): Promise<User>
}

// --- Task Repository ---
export interface ITaskRepository {
  create(ctx: TenantContext, data: Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'tags'>): Promise<Task>
  findById(ctx: TenantContext, id: string): Promise<Task | null>
  findAll(ctx: TenantContext, params?: PaginationParams & { status?: string; priority?: string }): Promise<PaginatedResult<Task>>
  update(ctx: TenantContext, id: string, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'due_date' | 'tags'>>): Promise<Task>
  delete(ctx: TenantContext, id: string): Promise<void>
  countByStatus(ctx: TenantContext): Promise<Record<string, number>>
}

// --- Event Repository ---
export interface IEventRepository {
  create(ctx: TenantContext, data: Pick<Event, 'title' | 'description' | 'start_time' | 'end_time' | 'all_day' | 'location' | 'color' | 'recurrence'>): Promise<Event>
  findById(ctx: TenantContext, id: string): Promise<Event | null>
  findByDateRange(ctx: TenantContext, start: string, end: string): Promise<Event[]>
  findUpcoming(ctx: TenantContext, limit?: number): Promise<Event[]>
  update(ctx: TenantContext, id: string, data: Partial<Pick<Event, 'title' | 'description' | 'start_time' | 'end_time' | 'all_day' | 'location' | 'color' | 'recurrence'>>): Promise<Event>
  delete(ctx: TenantContext, id: string): Promise<void>
}

// --- Note Repository ---
export interface INoteRepository {
  create(ctx: TenantContext, data: Pick<Note, 'title' | 'content' | 'tags' | 'is_pinned'>): Promise<Note>
  findById(ctx: TenantContext, id: string): Promise<Note | null>
  findAll(ctx: TenantContext, params?: PaginationParams): Promise<PaginatedResult<Note>>
  update(ctx: TenantContext, id: string, data: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'is_pinned'>>): Promise<Note>
  delete(ctx: TenantContext, id: string): Promise<void>
}

// --- Transaction Repository ---
export interface ITransactionRepository {
  create(ctx: TenantContext, data: Pick<Transaction, 'type' | 'amount' | 'currency' | 'category' | 'description' | 'date' | 'is_recurring' | 'recurrence_interval'>): Promise<Transaction>
  findById(ctx: TenantContext, id: string): Promise<Transaction | null>
  findAll(ctx: TenantContext, params?: PaginationParams & { type?: string; category?: string; startDate?: string; endDate?: string }): Promise<PaginatedResult<Transaction>>
  update(ctx: TenantContext, id: string, data: Partial<Pick<Transaction, 'type' | 'amount' | 'category' | 'description' | 'date'>>): Promise<Transaction>
  delete(ctx: TenantContext, id: string): Promise<void>
  getSummary(ctx: TenantContext, month?: string): Promise<{ income: number; expense: number; balance: number }>
}

// --- Goal Repository ---
export interface IGoalRepository {
  create(ctx: TenantContext, data: Pick<Goal, 'title' | 'description' | 'target_value' | 'unit' | 'deadline'>): Promise<Goal>
  findById(ctx: TenantContext, id: string): Promise<Goal | null>
  findAll(ctx: TenantContext, params?: PaginationParams & { status?: string }): Promise<PaginatedResult<Goal>>
  update(ctx: TenantContext, id: string, data: Partial<Pick<Goal, 'title' | 'description' | 'target_value' | 'current_value' | 'unit' | 'deadline' | 'status'>>): Promise<Goal>
  delete(ctx: TenantContext, id: string): Promise<void>
}

// --- Habit Repository ---
export interface IHabitRepository {
  create(ctx: TenantContext, data: Pick<Habit, 'title' | 'description' | 'frequency' | 'target_count' | 'color'>): Promise<Habit>
  findById(ctx: TenantContext, id: string): Promise<Habit | null>
  findAll(ctx: TenantContext): Promise<Habit[]>
  update(ctx: TenantContext, id: string, data: Partial<Pick<Habit, 'title' | 'description' | 'frequency' | 'target_count' | 'color' | 'is_active'>>): Promise<Habit>
  delete(ctx: TenantContext, id: string): Promise<void>
  logCompletion(ctx: TenantContext, habitId: string, note?: string): Promise<HabitLog>
  getLogsForDate(ctx: TenantContext, date: string): Promise<HabitLog[]>
  getLogsForRange(ctx: TenantContext, habitId: string, start: string, end: string): Promise<HabitLog[]>
}

// --- Chat Repository ---
export interface IChatRepository {
  saveMessage(ctx: TenantContext, data: Pick<ChatMessage, 'role' | 'content' | 'metadata'>): Promise<ChatMessage>
  getHistory(ctx: TenantContext, limit?: number): Promise<ChatMessage[]>
  clearHistory(ctx: TenantContext): Promise<void>
}
