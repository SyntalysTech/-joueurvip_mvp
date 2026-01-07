'use client'

import { useThemeStore } from '@/stores/theme'
import { Moon, Sun } from './icons'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeStore()

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      // System - check current and toggle opposite
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'light' : 'dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        `
        relative w-10 h-10
        flex items-center justify-center
        rounded-lg
        text-[rgb(var(--color-text-secondary))]
        hover:text-[rgb(var(--color-text-primary))]
        hover:bg-[rgb(var(--color-bg-secondary))]
        transition-all duration-200
        `,
        className
      )}
      aria-label="Changer de thème"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
