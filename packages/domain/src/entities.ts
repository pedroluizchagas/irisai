export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
}

export interface User {
  id: string
  tenant_id: string
  name: string
  email: string
  password_hash: string
  role: 'owner' | 'admin' | 'member'
  avatar_url: string | null
  created_at: string
}

export interface Task {
  id: string
  tenant_id: string
  user_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  tags: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  tenant_id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  all_day: boolean
  location: string | null
  color: string | null
  recurrence: string | null
  created_at: string
}

export interface Note {
  id: string
  tenant_id: string
  user_id: string
  title: string
  content: string | null
  tags: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  tenant_id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  currency: string
  category: string
  description: string | null
  date: string
  is_recurring: boolean
  recurrence_interval: string | null
  created_at: string
}

export interface Goal {
  id: string
  tenant_id: string
  user_id: string
  title: string
  description: string | null
  target_value: number | null
  current_value: number
  unit: string | null
  deadline: string | null
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  tenant_id: string
  user_id: string
  title: string
  description: string | null
  frequency: 'daily' | 'weekly' | 'monthly'
  target_count: number
  color: string | null
  is_active: boolean
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  tenant_id: string
  user_id: string
  completed_at: string
  note: string | null
}

export interface ChatMessage {
  id: string
  tenant_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: string | null
  created_at: string
}

export interface AuthSession {
  user: {
    id: string
    tenantId: string
    name: string
    email: string
    role: string
  }
}
