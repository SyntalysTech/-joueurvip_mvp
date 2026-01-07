'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { useAuthStore } from '@/stores/auth'
import {
  Home,
  Plus,
  MessageSquare,
  User,
  FileText,
  LogOut,
  Settings,
} from '@/components/ui/icons'
import { createClient, resetClient, clearAuthStorage } from '@/lib/supabase/client'

const navItems = [
  { href: '/joueur', icon: Home, label: 'Accueil' },
  { href: '/joueur/nouvelle-demande', icon: Plus, label: 'Nouvelle demande' },
  { href: '/joueur/demandes', icon: FileText, label: 'Mes demandes' },
  { href: '/joueur/messages', icon: MessageSquare, label: 'Messages' },
]

const bottomItems = [
  { href: '/joueur/profil', icon: Settings, label: 'Paramètres' },
]

export function PlayerSidebar() {
  const pathname = usePathname()
  const { profile, user, clear } = useAuthStore()

  const handleLogout = () => {
    console.log('Sidebar logout started...')

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

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 bg-[rgb(var(--color-bg-elevated))] border-r border-[rgb(var(--color-border-primary))]">
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-[rgb(var(--color-border-primary))]">
        <Logo size="sm" showText />
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgb(var(--color-bg-secondary))]">
          <div className="w-10 h-10 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || ''}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))] truncate">
              {profile?.full_name || 'Joueur VIP'}
            </p>
            <p className="text-xs text-[rgb(var(--color-text-muted))] truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/joueur' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[rgb(var(--color-accent))] text-white'
                  : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-[rgb(var(--color-border-primary))] space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-[rgb(var(--color-bg-secondary))] text-[rgb(var(--color-text-primary))]'
                  : 'text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-bg-secondary))] hover:text-[rgb(var(--color-text-primary))]'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-[rgb(var(--color-text-secondary))] hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>

      {/* Version */}
      <div className="px-6 py-3 border-t border-[rgb(var(--color-border-primary))]">
        <p className="text-xs text-[rgb(var(--color-text-muted))]">
          VIP Conciergerie v1.0.0
        </p>
      </div>
    </aside>
  )
}
