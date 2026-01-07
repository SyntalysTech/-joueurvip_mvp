'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PlayerHeader } from '@/components/layout/player-header'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { getCategoryIcon, Send, ChevronLeft } from '@/components/ui/icons'
import { formatDateTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RequestWithDetails, MessageWithSender } from '@/types/database'

export default function DemandeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [request, setRequest] = useState<RequestWithDetails | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()

      // Cargar demanda
      const { data: requestData } = await supabase
        .from('requests')
        .select(
          `
          *,
          category:categories(*),
          service:services(*)
        `
        )
        .eq('id', params.id)
        .single()

      if (requestData) {
        setRequest(requestData)
      }

      // Cargar mensajes
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', params.id)
        .order('created_at', { ascending: true })

      if (messagesData) {
        setMessages(messagesData)
      }

      setIsLoading(false)
    }

    loadData()

    // Suscripción a nuevos mensajes
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${params.id}`,
        },
        (payload: { new: MessageWithSender }) => {
          setMessages((prev) => [...prev, payload.new as MessageWithSender])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    await supabase.from('messages').insert({
      request_id: params.id,
      sender_id: user.id,
      sender_type: 'player',
      content: newMessage.trim(),
    })

    setNewMessage('')
    setIsSending(false)
  }

  if (isLoading) {
    return (
      <>
        <PlayerHeader title="Chargement..." />
        <div className="p-5">
          <div className="h-40 bg-[rgb(var(--color-bg-secondary))] rounded-xl animate-pulse" />
        </div>
      </>
    )
  }

  if (!request) {
    return (
      <>
        <PlayerHeader title="Erreur" />
        <div className="p-5 text-center">
          <p className="text-[rgb(var(--color-text-tertiary))]">
            Demande introuvable
          </p>
        </div>
      </>
    )
  }

  const Icon = getCategoryIcon(request.category?.icon || 'bell')

  return (
    <div className="flex flex-col h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Header */}
      <header className="sticky top-0 z-40 safe-top glass border-b border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center gap-4 px-5 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-[rgb(var(--color-text-primary))] truncate">
              {request.title}
            </h1>
            <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
              {request.category?.name_fr}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Request info */}
        <div className="px-5 py-6 border-b border-[rgb(var(--color-border-primary))]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-[rgb(var(--color-text-secondary))]" />
            </div>
            <div>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                Créée le {formatDate(request.created_at)}
              </p>
              {request.description && (
                <p className="mt-2 text-[rgb(var(--color-text-secondary))]">
                  {request.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="px-5 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[rgb(var(--color-text-muted))]">
                Votre concierge vous répondra ici
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.sender_type === 'player'
                    ? 'justify-end'
                    : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] px-4 py-3 rounded-2xl',
                    message.sender_type === 'player'
                      ? 'bg-[rgb(var(--color-accent))] text-white rounded-br-md'
                      : 'bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] rounded-bl-md'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      message.sender_type === 'player'
                        ? 'text-white/70'
                        : 'text-[rgb(var(--color-text-muted))]'
                    )}
                  >
                    {formatDateTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {!['completed', 'cancelled'].includes(request.status) && (
        <div className="fixed bottom-20 left-0 right-0 px-5 py-4 glass border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Votre message..."
              rows={1}
              className="flex-1 px-4 py-3 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-muted))] resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="shrink-0 w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
