import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Missing Supabase env vars:', { url: !!url, key: !!key })
    throw new Error('Missing Supabase configuration')
  }

  if (!client) {
    client = createBrowserClient(url, key)
  }

  return client
}

export function resetClient() {
  client = null
}

// Clear auth storage - only use on logout
export function clearAuthStorage() {
  if (typeof window === 'undefined') return

  const supabaseKeys = Object.keys(localStorage).filter(key =>
    key.startsWith('sb-') || key.includes('supabase')
  )
  supabaseKeys.forEach(key => localStorage.removeItem(key))

  const sessionKeys = Object.keys(sessionStorage).filter(key =>
    key.startsWith('sb-') || key.includes('supabase')
  )
  sessionKeys.forEach(key => sessionStorage.removeItem(key))

  resetClient()
}
