import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-base' },
    md: { icon: 36, text: 'text-lg' },
    lg: { icon: 48, text: 'text-xl' },
  }

  const { icon, text } = sizes[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Logo Mark - Diseño geométrico premium */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: icon, height: icon }}
      >
        {/* Forma externa */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className="absolute inset-0 w-full h-full"
        >
          {/* Cuadrado rotado (diamante) */}
          <rect
            x="24"
            y="4"
            width="28"
            height="28"
            rx="3"
            transform="rotate(45 24 24)"
            className="fill-[rgb(var(--color-accent))]"
          />
          {/* Línea interior */}
          <path
            d="M24 14L34 24L24 34L14 24L24 14Z"
            className="fill-[rgb(var(--color-bg-primary))]"
          />
          {/* Punto central */}
          <circle
            cx="24"
            cy="24"
            r="3"
            className="fill-[rgb(var(--color-accent))]"
          />
        </svg>
      </div>

      {/* Texto */}
      {showText && (
        <span
          className={cn(
            'font-semibold tracking-tight text-[rgb(var(--color-text-primary))]',
            text
          )}
        >
          JoueurVIP
        </span>
      )}
    </div>
  )
}
