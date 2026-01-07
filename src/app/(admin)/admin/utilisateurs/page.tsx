'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Search, User } from '@/components/ui/icons'
import { formatDate } from '@/lib/utils'
import type { Profile, AppRole } from '@/types/database'

interface UserWithRoles extends Profile {
  roles: AppRole[]
}

export default function UtilisateursPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUsers = async () => {
      const supabase = createClient()

      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: roles } = await supabase.from('user_roles').select('*')

      if (profiles) {
        const usersWithRoles = profiles.map((profile: Profile) => ({
          ...profile,
          roles:
            roles
              ?.filter((r: { user_id: string; role: AppRole }) => r.user_id === profile.id)
              .map((r: { role: AppRole }) => r.role) || [],
        }))

        setUsers(usersWithRoles)
      }

      setIsLoading(false)
    }

    loadUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: AppRole) => {
    const styles = {
      admin: 'bg-red-500/10 text-red-500 border-red-500/20',
      concierge: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      player: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    const labels = {
      admin: 'Admin',
      concierge: 'Concierge',
      player: 'Joueur',
    }
    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[role]}`}
      >
        {labels[role]}
      </span>
    )
  }

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
            Utilisateurs
          </h1>
          <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
            {users.length} utilisateur{users.length !== 1 && 's'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-80 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_200px_140px] gap-4 px-5 py-3 bg-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
          <div>Utilisateur</div>
          <div>Rôles</div>
          <div>Inscrit le</div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-[rgb(var(--color-text-muted))]">
            Chargement...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-[rgb(var(--color-text-muted))]">
            Aucun utilisateur trouvé
          </div>
        ) : (
          <div className="divide-y divide-[rgb(var(--color-border-primary))]">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_200px_140px] gap-4 items-center px-5 py-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                    )}
                  </div>
                  <span className="font-medium text-[rgb(var(--color-text-primary))] truncate">
                    {user.full_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {user.roles.length === 0 ? (
                    <span className="text-sm text-[rgb(var(--color-text-muted))]">
                      Aucun rôle
                    </span>
                  ) : (
                    user.roles.map((role) => (
                      <span key={role}>{getRoleBadge(role)}</span>
                    ))
                  )}
                </div>
                <div className="text-sm text-[rgb(var(--color-text-tertiary))]">
                  {formatDate(user.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
