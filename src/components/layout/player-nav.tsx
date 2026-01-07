'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Home, Plus, MessageSquare, User } from '@/components/ui/icons'

const navItems = [
  { href: '/joueur', icon: Home, label: 'Accueil' },
  { href: '/joueur/nouvelle-demande', icon: Plus, label: 'Demande' },
  { href: '/joueur/messages', icon: MessageSquare, label: 'Messages' },
  { href: '/joueur/profil', icon: User, label: 'Profil' },
]

export function PlayerNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="glass border-t border-[rgb(var(--color-border-primary))]">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/joueur' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200',
                  isActive
                    ? 'text-[rgb(var(--color-accent))]'
                    : 'text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-secondary))]'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
