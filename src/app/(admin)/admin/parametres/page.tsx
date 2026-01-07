'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useThemeStore } from '@/stores/theme'
import { Button } from '@/components/ui/button'
import { getCategoryIcon, Moon, Sun, Shield } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

export default function AdminParametresPage() {
  const { theme, setTheme } = useThemeStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient()

      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')

      if (data) {
        setCategories(data)
      }

      setIsLoading(false)
    }

    loadCategories()
  }, [])

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: null },
  ] as const

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[rgb(var(--color-text-primary))]">
          Paramètres
        </h1>
        <p className="text-[rgb(var(--color-text-tertiary))] mt-1">
          Configuration du système
        </p>
      </div>

      {/* Appearance */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-4">
          Apparence
        </h2>
        <div className="p-5 bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl">
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            Thème de l'interface
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

      {/* Categories */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-4">
          Catégories de services
        </h2>
        <div className="bg-[rgb(var(--color-bg-elevated))] border border-[rgb(var(--color-border-primary))] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-[rgb(var(--color-text-muted))]">
              Chargement...
            </div>
          ) : (
            <div className="divide-y divide-[rgb(var(--color-border-primary))]">
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.icon)
                return (
                  <div
                    key={category.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[rgb(var(--color-bg-secondary))] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[rgb(var(--color-text-primary))]">
                        {category.name_fr}
                      </p>
                      <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                        {category.slug}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'px-2 py-1 text-xs font-medium rounded',
                        category.is_active
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-red-500/10 text-red-500'
                      )}
                    >
                      {category.is_active ? 'Actif' : 'Inactif'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                Row Level Security
              </p>
              <p className="text-sm text-[rgb(var(--color-text-tertiary))]">
                Activé sur toutes les tables
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Version */}
      <div className="mt-12 text-center">
        <p className="text-sm text-[rgb(var(--color-text-muted))]">
          VIP Conciergerie · Version 1.0.0 · Admin
        </p>
      </div>
    </div>
  )
}
