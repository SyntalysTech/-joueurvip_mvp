'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Identifiants incorrects')
      setIsLoading(false)
      return
    }

    if (data.user) {
      // Obtener roles para redirigir
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)

      console.log('User ID:', data.user.id)
      console.log('Roles query result:', roles)
      console.log('Roles error:', rolesError)

      const userRoles = roles?.map((r: { role: string }) => r.role) || []
      console.log('User roles:', userRoles)

      if (userRoles.includes('admin')) {
        console.log('Redirecting to /admin')
        window.location.href = '/admin'
      } else if (userRoles.includes('concierge')) {
        console.log('Redirecting to /conciergerie')
        window.location.href = '/conciergerie'
      } else {
        console.log('Redirecting to /joueur')
        window.location.href = '/joueur'
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Logo size="md" />
        <ThemeToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))] mb-2">
              Connexion
            </h1>
            <p className="text-[rgb(var(--color-text-tertiary))]">
              Accédez à votre espace privé
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="email"
              type="email"
              label="Adresse e-mail"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              type="password"
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          {/* Footer text */}
          <p className="mt-8 text-center text-sm text-[rgb(var(--color-text-muted))]">
            Accès réservé aux membres autorisés
          </p>
        </div>
      </main>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--color-border-primary))] to-transparent" />
    </div>
  )
}
