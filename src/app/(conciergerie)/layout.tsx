import { ConciergeSidebar } from '@/components/layout/concierge-sidebar'

export default function ConciergerieLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      <ConciergeSidebar />
      <main className="ml-64">{children}</main>
    </div>
  )
}
