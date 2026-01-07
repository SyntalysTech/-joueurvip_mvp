'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getCategoryIcon, Send, ChevronLeft, User } from '@/components/ui/icons'
import { formatDateTime, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { RequestWithDetails, MessageWithSender, RequestStatus } from '@/types/database'

const statusOptions: { value: RequestStatus; label: string }[] = [
  { value: 'new', label: 'Nouvelle' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting_player', label: 'En attente du joueur' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
]

export default function ConciergeDemandeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [request, setRequest] = useState<RequestWithDetails | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const headers = {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      }

      // Get request with categories and services
      const response = await fetch(
        `${url}/rest/v1/requests?select=*,category:categories(*),service:services(*)&id=eq.${params.id}`,
        { headers }
      )

      const data = await response.json()

      if (response.ok && Array.isArray(data) && data.length > 0) {
        const requestData = data[0]

        // Fetch player profile
        if (requestData.player_id) {
          const profileResponse = await fetch(
            `${url}/rest/v1/profiles?select=*&id=eq.${requestData.player_id}`,
            { headers }
          )
          const profiles = await profileResponse.json()
          if (profiles && profiles.length > 0) {
            requestData.player = profiles[0]
          }
        }

        setRequest(requestData as RequestWithDetails)
        setInternalNote(requestData.internal_notes || '')
      }

      // Fetch messages
      const messagesResponse = await fetch(
        `${url}/rest/v1/messages?select=*&request_id=eq.${params.id}&order=created_at.asc`,
        { headers }
      )
      const messagesData = await messagesResponse.json()

      if (messagesResponse.ok && Array.isArray(messagesData)) {
        setMessages(messagesData)
      }

      setIsLoading(false)
    }

    loadData()

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

  const handleSendMessage = async () => {
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
      sender_type: 'concierge',
      content: newMessage.trim(),
    })

    setNewMessage('')
    setIsSending(false)
  }

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (!request) return

    setIsUpdating(true)
    const supabase = createClient()

    await supabase
      .from('requests')
      .update({ status: newStatus })
      .eq('id', request.id)

    setRequest({ ...request, status: newStatus })
    setIsUpdating(false)
  }

  const handleSaveNotes = async () => {
    if (!request) return

    setIsUpdating(true)
    const supabase = createClient()

    await supabase
      .from('requests')
      .update({ internal_notes: internalNote })
      .eq('id', request.id)

    setIsUpdating(false)
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-40 bg-[rgb(var(--color-bg-secondary))] rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-8 text-center">
        <p className="text-[rgb(var(--color-text-tertiary))]">
          Demande introuvable
        </p>
      </div>
    )
  }

  const Icon = getCategoryIcon(request.category?.icon || 'bell')

  return (
    <div className="flex h-screen">
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 px-8 py-5 border-b border-[rgb(var(--color-border-primary))]">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-xl bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {request.title}
            </h1>
            <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
              {request.category?.name_fr} · {request.service?.name_fr}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Request description */}
          {request.description && (
            <div className="p-4 bg-[rgb(var(--color-bg-secondary))] rounded-xl mb-6">
              <p className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] mb-1">
                Description de la demande
              </p>
              <p className="text-[rgb(var(--color-text-primary))]">
                {request.description}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.sender_type === 'concierge'
                  ? 'justify-end'
                  : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] px-4 py-3 rounded-2xl',
                  message.sender_type === 'concierge'
                    ? 'bg-[rgb(var(--color-accent))] text-white rounded-br-md'
                    : 'bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-primary))] rounded-bl-md'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    'text-[10px] mt-1',
                    message.sender_type === 'concierge'
                      ? 'text-white/70'
                      : 'text-[rgb(var(--color-text-muted))]'
                  )}
                >
                  {formatDateTime(message.created_at)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-[rgb(var(--color-border-primary))]">
          <div className="flex items-end gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Répondre au joueur..."
              rows={2}
              className="flex-1 px-4 py-3 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-muted))] resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="shrink-0"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-80 border-l border-[rgb(var(--color-border-primary))] bg-[rgb(var(--color-bg-elevated))] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Player */}
          <div>
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] mb-3">
              Joueur
            </h3>
            <div className="flex items-center gap-3 p-3 bg-[rgb(var(--color-bg-secondary))] rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
                <User className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
              </div>
              <div>
                <p className="font-medium text-[rgb(var(--color-text-primary))]">
                  {request.player?.full_name}
                </p>
                <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  {request.player?.phone || 'Pas de téléphone'}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] mb-3">
              Statut
            </h3>
            <select
              value={request.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as RequestStatus)
              }
              disabled={isUpdating}
              className="w-full h-10 px-3 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border-primary))] rounded-lg text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] mb-3">
              Détails
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-tertiary))]">
                  Créée le
                </span>
                <span className="text-[rgb(var(--color-text-primary))]">
                  {formatDate(request.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-tertiary))]">
                  Mise à jour
                </span>
                <span className="text-[rgb(var(--color-text-primary))]">
                  {formatDate(request.updated_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-tertiary))]">
                  Catégorie
                </span>
                <span className="text-[rgb(var(--color-text-primary))]">
                  {request.category?.name_fr}
                </span>
              </div>
            </div>
          </div>

          {/* Internal notes */}
          <div>
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] mb-3">
              Notes internes
            </h3>
            <Textarea
              placeholder="Notes privées (non visibles par le joueur)..."
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              variant="secondary"
              size="sm"
              className="mt-2 w-full"
              onClick={handleSaveNotes}
              disabled={isUpdating}
            >
              Enregistrer les notes
            </Button>
          </div>
        </div>
      </aside>
    </div>
  )
}
