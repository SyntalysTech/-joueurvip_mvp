'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, User, Shield, Users } from '@/components/ui/icons'
import type { Profile, AppRole } from '@/types/database'

interface UserWithRoles extends Profile {
  roles: AppRole[]
}

export default function RolesPage() {
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadUsers = async () => {
    const supabase = createClient()

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')

    const { data: roles } = await supabase.from('user_roles').select('*')

    if (profiles) {
      const usersWithRoles = profiles.map((profile: Profile) => ({
        ...profile,
        roles:
          roles?.filter((r: { user_id: string; role: AppRole }) => r.user_id === profile.id).map((r: { role: AppRole }) => r.role) ||
          [],
      }))

      setUsers(usersWithRoles)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleRole = async (userId: string, role: AppRole, hasRole: boolean) => {
    setUpdating(userId)
    const supabase = createClient()

    if (hasRole) {
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)
    } else {
      await supabase.from('user_roles').insert({
        user_id: userId,
        role,
      })
    }

    await loadUsers()
    setUpdating(null)
  }

  const filteredUsers = users.filter(
    (u) =>
      !searchQuery ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const roleConfig: { role: AppRole; label: string; icon: typeof Shield }[] = [
    { role: 'player', label: 'Joueur', icon: Users },
    { role: 'concierge', label: 'Concierge', icon: Shield },
    { role: 'admin', label: 'Admin', icon: Shield },
  ]

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
          Gestion des rôles
        </h1>
        <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
          Attribuez ou retirez des rôles aux utilisateurs
        </p>
      </div>

      {/* Search */}
      <div className="relative w-80 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-muted))]" />
        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_120px] gap-4 px-5 py-3 bg-[rgb(var(--color-bg-secondary))] border-b border-[rgb(var(--color-border-primary))] text-sm font-medium text-[rgb(var(--color-text-tertiary))]">
          <div>Utilisateur</div>
          {roleConfig.map((r) => (
            <div key={r.role} className="text-center">
              {r.label}
            </div>
          ))}
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
                className="grid grid-cols-[1fr_120px_120px_120px] gap-4 items-center px-5 py-4"
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
                {roleConfig.map((r) => {
                  const hasRole = user.roles.includes(r.role)
                  return (
                    <div key={r.role} className="flex justify-center">
                      <button
                        onClick={() => toggleRole(user.id, r.role, hasRole)}
                        disabled={updating === user.id}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          hasRole
                            ? 'bg-[rgb(var(--color-accent))] border-[rgb(var(--color-accent))] text-white'
                            : 'border-[rgb(var(--color-border-secondary))] text-[rgb(var(--color-text-muted))] hover:border-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent))]'
                        } ${updating === user.id ? 'opacity-50' : ''}`}
                      >
                        <r.icon className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Les changements de rôles prennent effet immédiatement. Un utilisateur
          doit se reconnecter pour voir les modifications.
        </p>
      </div>
    </div>
  )
}
