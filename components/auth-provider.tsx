'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import useSWR from 'swr'

interface AuthUser {
  userId: string
  tenantId: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Not authenticated')
  return r.json()
}).then(d => d.data?.user ?? null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, mutate } = useSWR<AuthUser | null>('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    fallbackData: null,
  })
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isLoading) setIsReady(true)
  }, [isLoading])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Erro ao fazer login')
    await mutate()
  }, [mutate])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Erro ao registrar')
    await mutate()
  }, [mutate])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate(null, false)
  }, [mutate])

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading: !isReady, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
