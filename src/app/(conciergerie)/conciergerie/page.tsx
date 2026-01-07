'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { StatusBadge } from '@/components/ui/status-badge'
import { getCategoryIcon, ChevronRight, Clock, FileText, Users } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/utils'
import type { RequestWithDetails, RequestStatus } from '@/types/database'

interface Stats {
  total: number
  new: number
  inProgress: number
  today: number
}

export default function ConciergerieDashboardPage() {
  const [requests, setRequests] = useState<RequestWithDetails[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, new: 0, inProgress: 0, today: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const headers = {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }

      // Get requests with categories and services
      const response = await fetch(
        `${url}/rest/v1/requests?select=*,category:categories(*),service:services(*)&order=created_at.desc`,
        { headers }
      )

      const data = await response.json()

      if (response.ok && Array.isArray(data)) {
        // Get unique player IDs
        const playerIds = [...new Set(data.map((r: { player_id: string }) => r.player_id))]

        let requestsWithPlayers = data

        // Fetch profiles for these players
        if (playerIds.length > 0) {
          const profilesResponse = await fetch(
            `${url}/rest/v1/profiles?select=*&id=in.(${playerIds.join(',')})`,
            { headers }
          )
          const profiles = await profilesResponse.json()

          // Map profiles by ID
          const profilesMap = new Map(
            (profiles || []).map((p: { id: string }) => [p.id, p])
          )

          // Attach player to each request
          requestsWithPlayers = data.map((r: { player_id: string }) => ({
            ...r,
            player: profilesMap.get(r.player_id) || null
          }))
        }

        setRequests(requestsWithPlayers as RequestWithDetails[])

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        setStats({
          total: requestsWithPlayers.length,
          new: requestsWithPlayers.filter((r: RequestWithDetails) => r.status === 'new').length,
          inProgress: requestsWithPlayers.filter((r: RequestWithDetails) => r.status === 'in_progress').length,
          today: requestsWithPlayers.filter((r: RequestWithDetails) => new Date(r.created_at) >= today).length,
        })
      }

      setIsLoading(false)
    }

    loadData()
  }, [])

  const newRequests = requests.filter((r) => r.status === 'new').slice(0, 5)
  const activeRequests = requests
    .filter((r) => ['in_progress', 'waiting_player'].includes(r.status))
    .slice(0, 5)

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
          Tableau de bord
        </h1>
        <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
          Vue d'ensemble des demandes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
              Nouvelles
            </span>
          </div>
          <p className="text-3xl font-semibold text-[rgb(var(--color-text-primary))]">
            {stats.new}
          </p>
        </div>

        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
              En cours
            </span>
          </div>
          <p className="text-3xl font-semibold text-[rgb(var(--color-text-primary))]">
            {stats.inProgress}
          </p>
        </div>

        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
              Aujourd'hui
            </span>
          </div>
          <p className="text-3xl font-semibold text-[rgb(var(--color-text-primary))]">
            {stats.today}
          </p>
        </div>

        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-neutral-500" />
            </div>
            <span className="text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
              Total
            </span>
          </div>
          <p className="text-3xl font-semibold text-[rgb(var(--color-text-primary))]">
            {stats.total}
          </p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* New requests */}
        <div className="bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--color-border-primary))]">
            <h2 className="font-medium text-[rgb(var(--color-text-primary))]">
              Nouvelles demandes
            </h2>
            <Link
              href="/conciergerie/demandes?status=new"
              className="text-sm text-[rgb(var(--color-accent))] hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <div className="divide-y divide-[rgb(var(--color-border-primary))]">
            {newRequests.length === 0 ? (
              <div className="px-5 py-8 text-center text-[rgb(var(--color-text-muted))]">
                Aucune nouvelle demande
              </div>
            ) : (
              newRequests.map((request) => {
                const Icon = getCategoryIcon(request.category?.icon || 'bell')
                return (
                  <Link
                    key={request.id}
                    href={`/conciergerie/demandes/${request.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                        {request.title}
                      </p>
                      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                        {request.player?.full_name} ·{' '}
                        {formatRelativeTime(request.created_at)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text-tertiary))]" />
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Active requests */}
        <div className="bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--color-border-primary))]">
            <h2 className="font-medium text-[rgb(var(--color-text-primary))]">
              En cours de traitement
            </h2>
            <Link
              href="/conciergerie/demandes?status=in_progress"
              className="text-sm text-[rgb(var(--color-accent))] hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <div className="divide-y divide-[rgb(var(--color-border-primary))]">
            {activeRequests.length === 0 ? (
              <div className="px-5 py-8 text-center text-[rgb(var(--color-text-muted))]">
                Aucune demande en cours
              </div>
            ) : (
              activeRequests.map((request) => {
                const Icon = getCategoryIcon(request.category?.icon || 'bell')
                return (
                  <Link
                    key={request.id}
                    href={`/conciergerie/demandes/${request.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                        {request.title}
                      </p>
                      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                        {request.player?.full_name}
                      </p>
                    </div>
                    <StatusBadge status={request.status} size="sm" />
                    <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text-tertiary))]" />
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
