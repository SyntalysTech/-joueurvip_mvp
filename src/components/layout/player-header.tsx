'use client'

import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuthStore } from '@/stores/auth'

interface PlayerHeaderProps {
  title?: string
  showGreeting?: boolean
}

export function PlayerHeader({
  title,
  showGreeting = false,
}: PlayerHeaderProps) {
  const { profile } = useAuthStore()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonjour'
    if (hour < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <header className="sticky top-0 z-40 safe-top glass border-b border-[rgb(var(--color-border-primary))] lg:relative lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
      <div className="flex items-center justify-between px-5 py-4 lg:px-8 lg:py-6">
        {/* Mobile: Logo + greeting/title */}
        <div className="flex items-center gap-4 lg:gap-0">
          <Logo size="sm" showText={false} className="lg:hidden" />
          <div>
            {showGreeting ? (
              <>
                <p className="text-xs text-[rgb(var(--color-text-tertiary))] lg:hidden">
                  {getGreeting()}
                </p>
                <h1 className="text-base lg:text-2xl font-semibold text-[rgb(var(--color-text-primary))] -mt-0.5 lg:mt-0">
                  <span className="lg:hidden">{firstName || 'Bienvenue'}</span>
                  <span className="hidden lg:inline">Tableau de bord</span>
                </h1>
              </>
            ) : title ? (
              <h1 className="text-lg lg:text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
                {title}
              </h1>
            ) : (
              <span className="text-sm font-medium text-[rgb(var(--color-text-secondary))] lg:text-2xl lg:font-semibold lg:text-[rgb(var(--color-text-primary))]">
                JoueurVIP
              </span>
            )}
          </div>
        </div>
        {/* Theme toggle - visible on both */}
        <ThemeToggle />
      </div>
    </header>
  )
}
