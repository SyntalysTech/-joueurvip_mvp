'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PlayerHeader } from '@/components/layout/player-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { getCategoryIcon, ChevronRight } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RequestWithDetails, RequestStatus } from '@/types/database'

const tabs: { value: 'active' | 'completed'; label: string }[] = [
  { value: 'active', label: 'En cours' },
  { value: 'completed', label: 'Terminées' },
]

export default function DemandesPage() {
  const [requests, setRequests] = useState<RequestWithDetails[]>([])
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRequests = async () => {
      const supabase = createClient()

      const { data } = await supabase
        .from('requests')
        .select(
          `
          *,
          category:categories(*),
          service:services(*)
        `
        )
        .order('created_at', { ascending: false })

      if (data) {
        setRequests(data)
      }
      setIsLoading(false)
    }

    loadRequests()
  }, [])

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'active') {
      return !['completed', 'cancelled'].includes(r.status)
    }
    return ['completed', 'cancelled'].includes(r.status)
  })

  return (
    <>
      <PlayerHeader title="Mes demandes" />

      <main className="animate-fade-in">
        {/* Tabs */}
        <div className="flex border-b border-[rgb(var(--color-border-primary))]">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex-1 py-4 text-sm font-medium transition-colors relative',
                activeTab === tab.value
                  ? 'text-[rgb(var(--color-text-primary))]'
                  : 'text-[rgb(var(--color-text-muted))]'
              )}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgb(var(--color-accent))]" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="px-5 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-[rgb(var(--color-bg-secondary))] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[rgb(var(--color-text-tertiary))]">
                {activeTab === 'active'
                  ? 'Aucune demande en cours'
                  : 'Aucune demande terminée'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
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
                      <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-tertiary))]">
                        <span>{request.category?.name_fr}</span>
                        <span>·</span>
                        <span>{formatRelativeTime(request.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={request.status} size="sm" />
                      <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] group-hover:text-[rgb(var(--color-text-tertiary))] transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
