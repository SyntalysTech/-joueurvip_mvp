'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
// Using fetch directly due to SDK issues
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategoryIcon, Search, ChevronRight, ChevronDown } from '@/components/ui/icons'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RequestWithDetails, RequestStatus } from '@/types/database'

const statusFilters: { value: RequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'new', label: 'Nouvelles' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting_player', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'completed', label: 'Terminées' },
  { value: 'cancelled', label: 'Annulées' },
]

function DemandesContent() {
  const searchParams = useSearchParams()
  const statusParam = searchParams.get('status') as RequestStatus | null

  const [requests, setRequests] = useState<RequestWithDetails[]>([])
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>(
    statusParam || 'all'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRequests = async () => {
      console.log('DemandesPage: Starting to load requests...')

      try {
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

        console.log('DemandesPage: Fetch completed, status:', response.status)

        const data = await response.json()
        console.log('DemandesPage: Data:', data)

        if (response.ok && Array.isArray(data)) {
          // Get unique player IDs
          const playerIds = [...new Set(data.map((r: { player_id: string }) => r.player_id))]

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
            const requestsWithPlayers = data.map((r: { player_id: string }) => ({
              ...r,
              player: profilesMap.get(r.player_id) || null
            }))

            setRequests(requestsWithPlayers as RequestWithDetails[])
          } else {
            setRequests(data as RequestWithDetails[])
          }
        } else {
          console.error('Error loading requests:', data)
        }
      } catch (err) {
        console.error('DemandesPage: Exception caught:', err)
      }

      setIsLoading(false)
    }

    loadRequests()
  }, [])

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.player?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
            Demandes
          </h1>
          <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
            {filteredRequests.length} demande
            {filteredRequests.length !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          {statusFilters.slice(0, 5).map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                statusFilter === filter.value
                  ? 'bg-[rgb(var(--color-accent))] text-white'
                  : 'text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_180px_140px_120px_100px_40px] gap-4 px-5 py-3 bg-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
          <div>Demande</div>
          <div>Joueur</div>
          <div>Catégorie</div>
          <div>Date</div>
          <div>Statut</div>
          <div></div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="p-8 text-center text-[rgb(var(--color-text-muted))]">
            Chargement...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-[rgb(var(--color-text-muted))]">
            Aucune demande trouvée
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--color-border-primary))]">
            {filteredRequests.map((request) => {
              const Icon = getCategoryIcon(request.category?.icon || 'bell')
              return (
                <Link
                  key={request.id}
                  href={`/conciergerie/demandes/${request.id}`}
                  className="grid grid-cols-[1fr_180px_140px_120px_100px_40px] gap-4 items-center px-5 py-4 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                    </div>
                    <span className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                      {request.title}
                    </span>
                  </div>
                  <div className="text-sm text-[rgb(var(--color-text-secondary))] truncate">
                    {request.player?.full_name}
                  </div>
                  <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
                    {request.category?.name_fr}
                  </div>
                  <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
                    {formatRelativeTime(request.created_at)}
                  </div>
                  <div>
                    <StatusBadge status={request.status} size="sm" />
                  </div>
                  <div className="flex justify-end">
                    <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text-tertiary))]" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DemandesPage() {
  return (
    <Suspense fallback={<div className="p-8">Chargement...</div>}>
      <DemandesContent />
    </Suspense>
  )
}
