'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, FileText, Shield } from '@/components/ui/icons'

interface Stats {
  totalUsers: number
  totalPlayers: number
  totalConcierges: number
  totalRequests: number
  activeRequests: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPlayers: 0,
    totalConcierges: 0,
    totalRequests: 0,
    activeRequests: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const supabase = createClient()

      // Usuarios
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Roles
      const { data: roles } = await supabase.from('user_roles').select('role')

      const players = roles?.filter((r: { role: string }) => r.role === 'player').length || 0
      const concierges =
        roles?.filter((r: { role: string }) => r.role === 'concierge').length || 0

      // Demandas
      const { data: requests } = await supabase
        .from('requests')
        .select('status')

      const activeRequests =
        requests?.filter(
          (r: { status: string }) => !['completed', 'cancelled'].includes(r.status)
        ).length || 0

      setStats({
        totalUsers: profilesCount || 0,
        totalPlayers: players,
        totalConcierges: concierges,
        totalRequests: requests?.length || 0,
        activeRequests,
      })

      setIsLoading(false)
    }

    loadStats()
  }, [])

  const statCards = [
    {
      label: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      label: 'Joueurs',
      value: stats.totalPlayers,
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      label: 'Concierges',
      value: stats.totalConcierges,
      icon: Shield,
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      label: 'Demandes totales',
      value: stats.totalRequests,
      icon: FileText,
      color: 'bg-neutral-500/10 text-neutral-500',
    },
    {
      label: 'Demandes actives',
      value: stats.activeRequests,
      icon: FileText,
      color: 'bg-amber-500/10 text-amber-500',
    },
  ]

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
          Administration
        </h1>
        <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
          Vue d'ensemble du système
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-[rgb(var(--color-text-primary))]">
              {isLoading ? '-' : stat.value}
            </p>
            <p className="text-sm text-[rgb(var(--color-text-tertiary))] mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-6 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
        <h2 className="font-medium text-[rgb(var(--color-text-primary))] mb-4">
          Accès administrateur
        </h2>
        <p className="text-[rgb(var(--color-text-secondary))]">
          Depuis ce panneau, vous pouvez gérer les utilisateurs, attribuer des
          rôles et configurer les paramètres du système.
        </p>
        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Les modifications effectuées ici affectent l'ensemble de la
            plateforme. Procédez avec précaution.
          </p>
        </div>
      </div>
    </div>
  )
}
