import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rutas públicas
  const publicRoutes = ['/connexion', '/inscription']
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Si no hay usuario y no es ruta pública, redirigir a login
  if (!user && !isPublicRoute && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/connexion'
    return NextResponse.redirect(url)
  }

  // Si hay usuario y está en página de login, redirigir según rol
  if (user && isPublicRoute) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const userRoles = roles?.map((r) => r.role) || []
    const url = request.nextUrl.clone()

    if (userRoles.includes('admin')) {
      url.pathname = '/admin'
    } else if (userRoles.includes('concierge')) {
      url.pathname = '/conciergerie'
    } else {
      url.pathname = '/joueur'
    }
    return NextResponse.redirect(url)
  }

  // Verificar acceso a rutas protegidas por rol
  if (user) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const userRoles = roles?.map((r) => r.role) || []

    if (pathname.startsWith('/admin') && !userRoles.includes('admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/joueur'
      return NextResponse.redirect(url)
    }

    if (
      pathname.startsWith('/conciergerie') &&
      !userRoles.includes('concierge') &&
      !userRoles.includes('admin')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/joueur'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
