import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/types/database'

interface StatusBadgeProps {
  status: RequestStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  new: {
    label: 'Nouvelle',
    className:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  in_progress: {
    label: 'En cours',
    className:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  waiting_player: {
    label: 'En attente',
    className:
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  },
  confirmed: {
    label: 'Confirmée',
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  completed: {
    label: 'Terminée',
    className:
      'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
  },
  cancelled: {
    label: 'Annulée',
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border',
        size === 'sm' ? 'px-2 py-0.5 text-xs rounded' : 'px-2.5 py-1 text-xs rounded-md',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
