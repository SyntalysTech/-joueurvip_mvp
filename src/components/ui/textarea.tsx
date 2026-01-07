import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            `
            w-full min-h-[120px] px-4 py-3
            bg-[rgb(var(--color-bg-elevated))]
            border border-[rgb(var(--color-border-primary))]
            rounded-lg
            text-[rgb(var(--color-text-primary))]
            placeholder:text-[rgb(var(--color-text-muted))]
            transition-all duration-200
            resize-none
            hover:border-[rgb(var(--color-border-secondary))]
            focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-accent))] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            `,
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
