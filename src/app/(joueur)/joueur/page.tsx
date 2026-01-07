'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clearAuthStorage, resetClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { PlayerHeader } from '@/components/layout/player-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { ChevronRight, Plus, Loader2 } from '@/components/ui/icons'
import { getCategoryIcon } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/utils'
import type { RequestWithDetails, Category } from '@/types/database'

export default function JoueurPage() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState<RequestWithDetails[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const headers = {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }

      try {
        const catResponse = await fetch(
          `${url}/rest/v1/categories?select=*&is_active=eq.true&order=display_order`,
          { headers }
        )

        if (!catResponse.ok) {
          const errData = await catResponse.json()
          setError(`Erreur: ${errData.message || 'Unknown error'}`)
          setIsLoading(false)
          return
        }

        const categoriesData = await catResponse.json()
        setCategories(categoriesData || [])
        setError(null)
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError('Erreur de connexion')
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  // Load requests when user is available
  useEffect(() => {
    if (!user?.id) return

    const loadRequests = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const headers = {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }

      try {
        const response = await fetch(
          `${url}/rest/v1/requests?select=*,category:categories(*),service:services(*)&player_id=eq.${user.id}&order=created_at.desc`,
          { headers }
        )

        if (response.ok) {
          const data = await response.json()
          setRequests(data || [])
        }
      } catch (err) {
        console.error('Error loading requests:', err)
      }
    }

    loadRequests()
  }, [user?.id])

  const activeRequests = requests.filter(
    (r) => !['completed', 'cancelled'].includes(r.status)
  )

  return (
    <>
      <PlayerHeader showGreeting />

      <main className="px-5 py-6 space-y-8 animate-fade-in">
        {/* Quick action */}
        <Link
          href="/joueur/nouvelle-demande"
          className="flex items-center justify-between p-5 bg-[rgb(var(--color-accent))] rounded-xl text-white group transition-transform active:scale-[0.98]"
        >
          <div>
            <p className="text-sm opacity-90">Besoin de quelque chose ?</p>
            <p className="text-lg font-semibold">Nouvelle demande</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
        </Link>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-500">{error}</p>
            <p className="text-xs text-red-400 mt-1">
              Vérifiez que la base de données est configurée
            </p>
            <button
              onClick={() => {
                clearAuthStorage()
                resetClient()
                window.location.reload()
              }}
              className="mt-3 px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Active requests */}
        {activeRequests.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                En cours
              </h2>
              <Link
                href="/joueur/demandes"
                className="text-sm text-[rgb(var(--color-accent))] hover:underline"
              >
                Tout voir
              </Link>
            </div>
            <div className="space-y-3">
              {activeRequests.map((request) => {
                const Icon = getCategoryIcon(request.category?.icon || 'bell')
                return (
                  <Link
                    key={request.id}
                    href={`/joueur/demandes/${request.id}`}
                    className="flex items-center gap-4 p-4 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl hover:border-[rgb(var(--color-border-secondary))] transition-all group"
                  >
                    <div className="w-11 h-11 rounded-lg bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                        {request.title}
                      </p>
                      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                        {request.category?.name_fr}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={request.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text-tertiary))] transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Categories grid */}
        <section>
          <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-4">
            Services
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[rgb(var(--color-text-muted))] animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-[rgb(var(--color-text-muted))]">
              <p>Aucun service disponible</p>
              <p className="text-xs mt-1">Veuillez contacter l'administrateur</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {categories.slice(0, 9).map((category) => {
                  const Icon = getCategoryIcon(category.icon)
                  return (
                    <Link
                      key={category.id}
                      href={`/joueur/nouvelle-demande?category=${category.slug}`}
                      className="flex flex-col items-center gap-2 p-4 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl hover:border-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-bg-secondary))] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-bg-secondary))] group-hover:bg-[rgb(var(--color-accent))]/10 flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5 text-[rgb(var(--color-text-secondary))] group-hover:text-[rgb(var(--color-accent))] transition-colors" />
                      </div>
                      <span className="text-xs text-center text-[rgb(var(--color-text-secondary))] font-medium leading-tight">
                        {category.name_fr}
                      </span>
                    </Link>
                  )
                })}
              </div>
              {categories.length > 9 && (
                <Link
                  href="/joueur/nouvelle-demande"
                  className="flex items-center justify-center gap-2 mt-3 py-3 text-sm text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-accent))] transition-colors"
                >
                  Voir tous les services
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </>
          )}
        </section>

        {/* Recent activity */}
        {requests.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-4">
              Activité récente
            </h2>
            <div className="space-y-2">
              {requests.slice(0, 3).map((request) => (
                <Link
                  key={request.id}
                  href={`/joueur/demandes/${request.id}`}
                  className="flex items-center justify-between py-3 border-b border-[rgb(var(--color-border-primary))] last:border-0 group"
                >
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors">
                      {request.title}
                    </p>
                    <p className="text-xs text-[rgb(var(--color-text-muted))]">
                      {formatRelativeTime(request.updated_at)}
                    </p>
                  </div>
                  <StatusBadge status={request.status} size="sm" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Empty state - only show if no requests AND categories loaded */}
        {!isLoading && requests.length === 0 && categories.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-[rgb(var(--color-text-muted))]">
              Aucune demande pour le moment
            </p>
          </div>
        )}
      </main>
    </>
  )
}
