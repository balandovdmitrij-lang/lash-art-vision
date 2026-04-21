import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole, UserProfile } from '../lib/supabase'

export type AuthScreen =
  | 'splash'
  | 'login'
  | 'role_select'
  | 'profile_setup'
  | 'app'

interface AuthState {
  authScreen: AuthScreen
  userId: string | null
  email: string | null
  profile: UserProfile | null

  setAuthScreen: (screen: AuthScreen) => void
  setUserId: (id: string) => void
  setEmail: (email: string) => void
  setProfile: (profile: UserProfile) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authScreen: 'splash',
      userId: null,
      email: null,
      profile: null,

      setAuthScreen: (screen) => set({ authScreen: screen }),
      setUserId: (id) => set({ userId: id }),
      setEmail: (email) => set({ email }),
      setProfile: (profile) => set({ profile, authScreen: 'app' }),
      logout: () =>
        set({ authScreen: 'login', userId: null, email: null, profile: null }),
    }),
    {
      name: 'lba-auth',
      partialize: (s) => ({
        userId: s.userId,
        email: s.email,
        profile: s.profile,
        // Always start from splash so session is verified on every load
        authScreen: 'splash' as const,
      }),
    }
  )
)

export function useRole(): UserRole | null {
  return useAuthStore((s) => s.profile?.role ?? null)
}

export function useIsClient() {
  return useAuthStore((s) => s.profile?.role === 'client')
}

export function useIsMaster() {
  return useAuthStore((s) => s.profile?.role === 'master')
}
