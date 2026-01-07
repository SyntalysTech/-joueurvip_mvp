'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth'
import { createClient } from '@/lib/supabase/client'
import type { Profile, AppRole } from '@/types/database'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setRoles, setLoading, clear } = useAuthStore()
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initializedRef.current) return
    initializedRef.current = true

    const supabase = createClient()
    let mounted = true

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    }

    console.log('AuthProvider: Initializing...')

    // Load user data using fetch directly (SDK has issues)
    const loadUserData = async (userId: string, email: string) => {
      console.log('Loading user data for:', userId)
      setUser({ id: userId, email })

      try {
        // Load profile and roles in parallel using fetch
        const [profileResponse, rolesResponse] = await Promise.all([
          fetch(`${url}/rest/v1/profiles?id=eq.${userId}&select=*`, { headers }),
          fetch(`${url}/rest/v1/user_roles?user_id=eq.${userId}&select=role`, { headers })
        ])

        const profileData = await profileResponse.json()
        const rolesData = await rolesResponse.json()

        console.log('Profile result:', profileData)
        console.log('Roles result:', rolesData)

        if (mounted && profileData && profileData.length > 0) {
          setProfile(profileData[0] as Profile)
        }

        if (mounted && rolesData && Array.isArray(rolesData)) {
          setRoles(rolesData.map((r: { role: string }) => r.role) as AppRole[])
        }
      } catch (err) {
        console.error('Error loading user data:', err)
      }

      if (mounted) {
        setLoading(false)
      }
    }

    // Initialize: try to get current session
    const initAuth = async () => {
      try {
        console.log('Checking initial session...')

        // Use getSession with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => {
            console.log('Session check timeout')
            resolve({ data: { session: null } })
          }, 3000)
        )

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise])

        console.log('Initial session:', session?.user?.id || 'none')

        if (!mounted) return

        if (session?.user) {
          await loadUserData(session.user.id, session.user.email!)
        } else {
          console.log('No initial session found')
          setLoading(false)
        }
      } catch (err) {
        console.error('Init auth error:', err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Listen for auth changes for login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)

        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user.id, session.user.email!)
        } else if (event === 'SIGNED_OUT') {
          clear()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Only update if we already have a user
          setUser({ id: session.user.id, email: session.user.email! })
        }
      }
    )

    // Start
    initAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setRoles, setLoading, clear])

  return <>{children}</>
}
