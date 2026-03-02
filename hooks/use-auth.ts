'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Not authenticated')
  return r.json()
}).then(d => d.data)

export function useAuth() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR('/api/auth/me', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate(null, { revalidate: false })
    router.push('/login')
  }, [mutate, router])

  return {
    user: data?.user || null,
    isLoading,
    isAuthenticated: !!data?.user && !error,
    logout,
    mutate,
  }
}
