 'use client'
 
 import * as React from 'react'
 import { useRouter } from 'next/navigation'
import Link from 'next/link'
 import { Card } from '@/components/ui/card'
 import { Input } from '@/components/ui/input'
 import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
 
 export default function LoginPage() {
   const router = useRouter()
   const [email, setEmail] = React.useState('')
   const [password, setPassword] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [error, setError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)
  const [remember, setRemember] = React.useState(true)
 
   async function handleLogin(e: React.FormEvent) {
     e.preventDefault()
     setError(null)
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValid) {
      setError('Email inválido')
      return
    }
    if (!password) {
      setError('Informe a senha')
       return
     }
     setLoading(true)
     try {
       const res = await fetch('/api/auth/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
       })
       const json = await res.json()
       if (!res.ok) {
         setError(json.error || 'Falha no login')
         return
       }
       router.push('/dashboard')
     } finally {
       setLoading(false)
     }
   }
 
   return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Bem-vindo de volta</h1>
          <p className="text-sm text-muted-foreground">Entre para acessar seu painel</p>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
              <span className="text-sm text-muted-foreground">Manter conectado</span>
            </div>
            <button type="button" className="text-sm text-muted-foreground hover:underline">
              Esqueci a senha
            </button>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <div className="text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Criar conta
          </Link>
        </div>
      </Card>
    </div>
   )
 }
