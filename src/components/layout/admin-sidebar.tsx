'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Shield,
} from '@/components/ui/icons'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Vue d\'ensemble' },
  { href: '/admin/utilisateurs', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/roles', icon: Shield, label: 'Rôles' },
  { href: '/admin/parametres', icon: Settings, label: 'Paramètres' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/connexion')
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[rgb(var(--color-bg-elevated))] border-r border-[rgb(var(--color-border-primary))] flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[rgb(var(--color-border-primary))]">
        <Logo size="md" />
        <span className="ml-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-red-500/10 text-red-500 rounded">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

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
