import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for test page
  if (request.nextUrl.pathname.startsWith('/test')) {
    return NextResponse.next()
  }

  try {
    return await updateSession(request)
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, clear cookies and continue
    const response = NextResponse.next()
    response.cookies.delete('sb-dgqbvbxcfitztjttbbox-auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
