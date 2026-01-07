'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient, clearAuthStorage, resetClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/auth'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/conciergerie', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/conciergerie/demandes', icon: FileText, label: 'Demandes' },
  { href: '/conciergerie/joueurs', icon: Users, label: 'Joueurs' },
  { href: '/conciergerie/parametres', icon: Settings, label: 'Paramètres' },
]

export function ConciergeSidebar() {
  const pathname = usePathname()
  const { clear } = useAuthStore()

  const handleLogout = () => {
    console.log('Concierge logout started...')
    clear()
    clearAuthStorage()
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(';').forEach((c) => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
    })
    try {
      const supabase = createClient()
      supabase.auth.signOut().catch(() => {})
    } catch {}
    resetClient()
    window.location.replace('/connexion')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[rgb(var(--color-bg-elevated))] border-r border-[rgb(var(--color-border-primary))] flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[rgb(var(--color-border-primary))]">
        <Logo size="md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/conciergerie' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))]'
                  : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-secondary))]'
              )}
            >
              <item.icon
                className="w-5 h-5"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[rgb(var(--color-border-primary))] space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-[rgb(var(--color-text-tertiary))]">
            Thème
          </span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[rgb(var(--color-text-secondary))] hover:text-red-500 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
