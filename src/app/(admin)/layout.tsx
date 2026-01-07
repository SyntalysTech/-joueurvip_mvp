import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-primary))]">
      <AdminSidebar />
      <main className="ml-64">{children}</main>
    </div>
  )
}
