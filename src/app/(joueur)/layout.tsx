import { PlayerNav } from '@/components/layout/player-nav'
import { PlayerSidebar } from '@/components/layout/player-sidebar'

export default function JoueurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      {/* Sidebar - solo visible en desktop (lg+) */}
      <PlayerSidebar />

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <div className="pb-20 lg:pb-0">
          {children}
        </div>
      </div>

      {/* Nav inferior - solo visible en móvil (hasta lg) */}
      <div className="lg:hidden">
        <PlayerNav />
      </div>
    </div>
  )
}
