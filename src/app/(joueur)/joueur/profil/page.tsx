'use client'

import { createClient, resetClient, clearAuthStorage } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { PlayerHeader } from '@/components/layout/player-header'
import {
  User,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Shield,
} from '@/components/ui/icons'

export default function ProfilPage() {
  const { profile, user, clear } = useAuthStore()
  const { theme, setTheme } = useThemeStore()

  const handleLogout = () => {
    console.log('Logout started...')

    // 1. Clear Zustand store first
    clear()

    // 2. Clear all storage
    clearAuthStorage()
    localStorage.clear()
    sessionStorage.clear()

    // 3. Clear all cookies
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })

    // 4. Try to sign out from Supabase (don't await)
    try {
      const supabase = createClient()
      supabase.auth.signOut().catch(() => {})
    } catch {
      // Ignore
    }

    // 5. Reset client singleton
    resetClient()

    console.log('Redirecting to /connexion...')

    // 6. Force full page reload to /connexion
    window.location.replace('/connexion')
  }

  const menuItems = [
    {
      icon: theme === 'dark' ? Moon : Sun,
      label: 'Apparence',
      value: theme === 'dark' ? 'Sombre' : theme === 'light' ? 'Clair' : 'Système',
      onClick: () => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
      },
    },
    {
      icon: Shield,
      label: 'Confidentialité',
      value: '',
      onClick: () => {},
    },
  ]

  return (
    <>
      <PlayerHeader title="Profil" />

      <main className="px-5 py-6 space-y-8 animate-fade-in">
        {/* Profile card */}
        <div className="flex items-center gap-4 p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="w-16 h-16 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-[rgb(var(--color-text-tertiary))]" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              {profile?.full_name || 'Joueur'}
            </h2>
            <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Settings */}
        <section>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-3">
            Paramètres
          </h3>
          <div className="bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl divide-y divide-[rgb(var(--color-border-primary))]">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-4 w-full px-4 py-4 text-left hover:bg-[rgb(var(--color-bg-secondary))] transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                </div>
                <span className="flex-1 text-[rgb(var(--color-text-primary))]">
                  {item.label}
                </span>
                {item.value && (
                  <span className="text-sm text-[rgb(var(--color-text-tertiary))]">
                    {item.value}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-muted))]" />
              </button>
            ))}
          </div>
        </section>

        {/* Logout */}
        <button
          type="button"
          onClick={() => {
            console.log('Button clicked!')
            handleLogout()
          }}
          className="w-full h-10 px-4 text-sm rounded-lg gap-2 inline-flex items-center justify-center font-medium transition-all duration-200 bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-border-secondary))] border border-[rgb(var(--color-border-primary))]"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-[rgb(var(--color-text-muted))]">
            JoueurVIP · v1.0.0
          </p>
          <a
            href="https://syntalys.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-accent))] transition-colors"
          >
            by Syntalys Tech
          </a>
        </div>
      </main>
    </>
  )
}
