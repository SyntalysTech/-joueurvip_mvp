'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PlayerHeader } from '@/components/layout/player-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { getCategoryIcon, ChevronRight } from '@/components/ui/icons'
import { formatRelativeTime } from '@/lib/utils'
import type { RequestWithDetails } from '@/types/database'

interface RequestWithMessages extends RequestWithDetails {
  last_message?: string
  last_message_at?: string
  unread_count?: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<RequestWithMessages[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadConversations = async () => {
      const supabase = createClient()

      // Obtener demandas con mensajes
      const { data: requests } = await supabase
        .from('requests')
        .select(
          `
          *,
          category:categories(*),
          service:services(*),
          messages(content, created_at, is_read, sender_type)
        `
        )
        .order('updated_at', { ascending: false })

      if (requests) {
        const withMessages = requests
          .map((r: any) => {
            const messages = r.messages || []
            const lastMessage = messages[messages.length - 1]
            const unreadCount = messages.filter(
              (m: any) => !m.is_read && m.sender_type === 'concierge'
            ).length

            return {
              ...r,
              last_message: lastMessage?.content,
              last_message_at: lastMessage?.created_at,
              unread_count: unreadCount,
            }
          })
          .filter((r: any) => r.messages.length > 0)

        setConversations(withMessages)
      }

      setIsLoading(false)
    }

    loadConversations()
  }, [])

  return (
    <>
      <PlayerHeader title="Messages" />

      <main className="animate-fade-in">
        {isLoading ? (
          <div className="px-5 py-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-[rgb(var(--color-bg-secondary))] rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[rgb(var(--color-text-tertiary))]">
              Aucune conversation
            </p>
            <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1">
              Vos échanges avec la conciergerie apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--color-border-primary))]">
            {conversations.map((conversation) => {
              const Icon = getCategoryIcon(
                conversation.category?.icon || 'bell'
              )
              return (
                <Link
                  key={conversation.id}
                  href={`/joueur/demandes/${conversation.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[rgb(var(--color-bg-secondary))] transition-colors"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                    </div>
                    {conversation.unread_count! > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[rgb(var(--color-accent))] rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">
                          {conversation.unread_count}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                        {conversation.title}
                      </p>
                      <span className="text-xs text-[rgb(var(--color-text-muted))] shrink-0">
                        {conversation.last_message_at &&
                          formatRelativeTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(var(--color-text-tertiary))] truncate mt-0.5">
                      {conversation.last_message}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))] shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
