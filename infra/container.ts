// Dependency Injection Container - Single Responsibility + Dependency Inversion
import { TaskRepository } from './repositories/task-repository'
import { EventRepository } from './repositories/event-repository'
import { NoteRepository } from './repositories/note-repository'
import { TransactionRepository } from './repositories/transaction-repository'
import { GoalRepository, HabitRepository } from './repositories/goal-habit-repository'
import { ChatRepository } from './repositories/chat-repository'

// Singleton instances (created once, reused)
let _taskRepo: TaskRepository | null = null
let _eventRepo: EventRepository | null = null
let _noteRepo: NoteRepository | null = null
let _transactionRepo: TransactionRepository | null = null
let _goalRepo: GoalRepository | null = null
let _habitRepo: HabitRepository | null = null
let _chatRepo: ChatRepository | null = null

export function getTaskRepository(): TaskRepository {
  if (!_taskRepo) _taskRepo = new TaskRepository()
  return _taskRepo
}

export function getEventRepository(): EventRepository {
  if (!_eventRepo) _eventRepo = new EventRepository()
  return _eventRepo
}

export function getNoteRepository(): NoteRepository {
  if (!_noteRepo) _noteRepo = new NoteRepository()
  return _noteRepo
}

export function getTransactionRepository(): TransactionRepository {
  if (!_transactionRepo) _transactionRepo = new TransactionRepository()
  return _transactionRepo
}

export function getGoalRepository(): GoalRepository {
  if (!_goalRepo) _goalRepo = new GoalRepository()
  return _goalRepo
}

export function getHabitRepository(): HabitRepository {
  if (!_habitRepo) _habitRepo = new HabitRepository()
  return _habitRepo
}

export function getChatRepository(): ChatRepository {
  if (!_chatRepo) _chatRepo = new ChatRepository()
  return _chatRepo
}
