'use client'

import { create } from 'zustand'
import type { Profile, AppRole } from '@/types/database'

interface AuthStore {
  user: { id: string; email: string } | null
  profile: Profile | null
  roles: AppRole[]
  isLoading: boolean
  setUser: (user: { id: string; email: string } | null) => void
  setProfile: (profile: Profile | null) => void
  setRoles: (roles: AppRole[]) => void
  setLoading: (loading: boolean) => void
  hasRole: (role: AppRole) => boolean
  clear: () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  roles: [],
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setRoles: (roles) => set({ roles }),
  setLoading: (isLoading) => set({ isLoading }),
  hasRole: (role) => get().roles.includes(role),
  clear: () => set({ user: null, profile: null, roles: [], isLoading: false }),
}))
