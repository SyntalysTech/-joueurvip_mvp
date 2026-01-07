import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion')
  }

  // Obtener roles del usuario
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const userRoles = roles?.map((r) => r.role) || []

  // Redirigir según rol
  if (userRoles.includes('admin')) {
    redirect('/admin')
  } else if (userRoles.includes('concierge')) {
    redirect('/conciergerie')
  } else {
    redirect('/joueur')
  }
}
