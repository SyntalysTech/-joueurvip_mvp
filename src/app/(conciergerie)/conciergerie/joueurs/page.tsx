'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
// Using fetch directly due to SDK issues
import { Input } from '@/components/ui/input'
import { Search, User, ChevronRight } from '@/components/ui/icons'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface PlayerWithStats extends Profile {
  total_requests: number
  active_requests: number
}

export default function JoueursPage() {
  const [players, setPlayers] = useState<PlayerWithStats[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const headers = {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }

        // Get users with player role
        const rolesResponse = await fetch(
          `${url}/rest/v1/user_roles?select=user_id&role=eq.player`,
          { headers }
        )
        const playerRoles = await rolesResponse.json()

        if (!playerRoles || playerRoles.length === 0) {
          setIsLoading(false)
          return
        }

        const playerIds = playerRoles.map((r: { user_id: string }) => r.user_id)

        // Get profiles
        const profilesResponse = await fetch(
          `${url}/rest/v1/profiles?select=*&id=in.(${playerIds.join(',')})`,
          { headers }
        )
        const profiles = await profilesResponse.json()

        // Get requests stats
        const requestsResponse = await fetch(
          `${url}/rest/v1/requests?select=player_id,status`,
          { headers }
        )
        const requests = await requestsResponse.json()

        if (profiles && Array.isArray(profiles)) {
          const playersWithStats = profiles.map((profile: Profile) => {
            const playerRequests =
              requests?.filter((r: { player_id: string; status: string }) => r.player_id === profile.id) || []
            return {
              ...profile,
              total_requests: playerRequests.length,
              active_requests: playerRequests.filter(
                (r: { status: string }) => !['completed', 'cancelled'].includes(r.status)
              ).length,
            }
          })

          setPlayers(playersWithStats)
        }
      } catch (err) {
        console.error('Error loading players:', err)
      }

      setIsLoading(false)
    }

    loadPlayers()
  }, [])

  const filteredPlayers = players.filter(
    (p) =>
      !searchQuery ||
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone?.includes(searchQuery)
  )

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
            Joueurs
          </h1>
          <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
            {players.length} joueur{players.length !== 1 && 's'} enregistré
            {players.length !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-80 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
        <Input
          placeholder="Rechercher un joueur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-32 bg-[rgb(var(--color-bg-secondary))] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[rgb(var(--color-text-tertiary))]">
            Aucun joueur trouvé
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl hover:border-[rgb(var(--color-border-secondary))] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center shrink-0">
                  {player.avatar_url ? (
                    <img
                      src={player.avatar_url}
                      alt={player.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                    {player.full_name}
                  </p>
                  <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                    {player.phone || 'Pas de téléphone'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[rgb(var(--color-border-primary))]">
                <div>
                  <p className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
                    {player.total_requests}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-muted))]">
                    demandes totales
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[rgb(var(--color-accent))]">
                    {player.active_requests}
                  </p>
                  <p className="text-xs text-[rgb(var(--color-text-muted))]">
                    en cours
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
