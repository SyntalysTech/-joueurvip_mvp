import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from './icons'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium
      transition-all duration-200
      disabled:opacity-50 disabled:pointer-events-none
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    `

    const variants = {
      primary: `
        bg-[rgb(var(--color-accent))] text-white
        hover:bg-[rgb(var(--color-accent-hover))]
        focus-visible:ring-[rgb(var(--color-accent))]
      `,
      secondary: `
        bg-[rgb(var(--color-bg-tertiary))] text-[rgb(var(--color-text-primary))]
        hover:bg-[rgb(var(--color-border-secondary))]
        border border-[rgb(var(--color-border-primary))]
      `,
      ghost: `
        text-[rgb(var(--color-text-secondary))]
        hover:text-[rgb(var(--color-text-primary))]
        hover:bg-[rgb(var(--color-bg-secondary))]
      `,
      danger: `
        bg-red-500 text-white
        hover:bg-red-600
        focus-visible:ring-red-500
      `,
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
      md: 'h-10 px-4 text-sm rounded-lg gap-2',
      lg: 'h-12 px-6 text-base rounded-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
