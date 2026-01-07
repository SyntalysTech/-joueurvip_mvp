'use client'

import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { Moon, Sun, User, Shield } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export default function ParametresPage() {
  const { theme, setTheme } = useThemeStore()
  const { profile, user } = useAuthStore()

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: null },
  ] as const

  return (
    <div className="p-8 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
          Paramètres
        </h1>
        <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
          Configuration de votre espace
        </p>
      </div>

      {/* Profile section */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-4">
          Profil
        </h2>
        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[rgb(var(--color-bg-tertiary))] flex items-center justify-center">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-[rgb(var(--color-text-tertiary))]" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-[rgb(var(--color-text-primary))]">
                {profile?.full_name || 'Concierge'}
              </p>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-4">
          Apparence
        </h2>
        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            Choisissez votre thème préféré
          </p>
          <div className="flex gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-all',
                  theme === option.value
                    ? 'border-[rgb(var(--color-accent))] bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))]'
                    : 'border-[rgb(var(--color-border-primary))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-border-secondary))]'
                )}
              >
                {option.icon && <option.icon className="w-4 h-4" />}
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section>
        <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-4">
          Sécurité
        </h2>
        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium text-[rgb(var(--color-text-primary))]">
                Connexion sécurisée
              </p>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                Vos données sont protégées
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Version */}
      <div className="mt-12 text-center">
        <p className="text-sm text-[rgb(var(--color-text-muted))]">
          JoueurVIP · Version 1.0.0
        </p>
      </div>
    </div>
  )
}
