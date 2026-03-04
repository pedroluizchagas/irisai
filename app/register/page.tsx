 'use client'
 
 import * as React from 'react'
 import { useRouter } from 'next/navigation'
 import Link from 'next/link'
 import { Card } from '@/components/ui/card'
 import { Input } from '@/components/ui/input'
 import { Button } from '@/components/ui/button'
 import { Label } from '@/components/ui/label'
 
 export default function RegisterPage() {
   const router = useRouter()
   const [name, setName] = React.useState('')
   const [email, setEmail] = React.useState('')
   const [password, setPassword] = React.useState('')
   const [workspace, setWorkspace] = React.useState('')
   const [loading, setLoading] = React.useState(false)
   const [error, setError] = React.useState<string | null>(null)
   const [showPassword, setShowPassword] = React.useState(false)
 
   async function handleRegister(e: React.FormEvent) {
     e.preventDefault()
     setError(null)
     const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
     if (!name.trim()) {
       setError('Informe seu nome')
       return
     }
     if (!emailValid) {
       setError('Email inválido')
       return
     }
     if (!password || password.length < 6) {
       setError('Senha deve ter pelo menos 6 caracteres')
       return
     }
     setLoading(true)
     try {
       const res = await fetch('/api/auth/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ name, email, password, tenantName: workspace || undefined }),
       })
       const json = await res.json()
       if (!res.ok) {
         setError(json.error || 'Falha ao criar conta')
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
           <h1 className="text-2xl font-semibold">Criar sua conta</h1>
           <p className="text-sm text-muted-foreground">Cadastre-se para começar</p>
         </div>
         {error ? <p className="text-sm text-destructive">{error}</p> : null}
         <form className="space-y-4" onSubmit={handleRegister}>
           <div className="space-y-2">
             <Label htmlFor="name">Nome</Label>
             <Input
               id="name"
               placeholder="Seu nome"
               value={name}
               onChange={(e) => setName(e.target.value)}
             />
           </div>
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
           <div className="space-y-2">
             <Label htmlFor="workspace">Workspace (opcional)</Label>
             <Input
               id="workspace"
               placeholder="Nome do workspace"
               value={workspace}
               onChange={(e) => setWorkspace(e.target.value)}
             />
           </div>
           <Button type="submit" className="w-full" disabled={loading}>
             {loading ? 'Criando...' : 'Criar conta'}
           </Button>
         </form>
         <div className="text-sm text-muted-foreground">
           Já tem conta?{' '}
           <Link href="/login" className="text-primary hover:underline">
             Entrar
           </Link>
         </div>
       </Card>
     </div>
   )
 }
