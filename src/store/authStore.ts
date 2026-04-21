import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole, UserProfile } from '../lib/supabase'
import type { ConfirmationResult } from 'firebase/auth'

export type AuthScreen =
  | 'splash'
  | 'phone'
  | 'otp'
  | 'role_select'
  | 'profile_setup'
  | 'app'

interface AuthState {
  authScreen: AuthScreen
  firebaseUid: string | null
  phone: string | null
  profile: UserProfile | null
  confirmationResult: ConfirmationResult | null

  setAuthScreen: (screen: AuthScreen) => void
  setFirebaseUid: (uid: string) => void
  setPhone: (phone: string) => void
  setProfile: (profile: UserProfile) => void
  setConfirmationResult: (result: ConfirmationResult) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authScreen: 'splash',
      firebaseUid: null,
      phone: null,
      profile: null,
      confirmationResult: null,

      setAuthScreen: (screen) => set({ authScreen: screen }),
      setFirebaseUid: (uid) => set({ firebaseUid: uid }),
      setPhone: (phone) => set({ phone }),
      setProfile: (profile) => set({ profile, authScreen: 'app' }),
      setConfirmationResult: (result) => set({ confirmationResult: result }),
      logout: () =>
        set({
          authScreen: 'phone',
          firebaseUid: null,
          phone: null,
          profile: null,
          confirmationResult: null,
        }),
    }),
    {
      name: 'lba-auth',
      partialize: (s) => ({
        firebaseUid: s.firebaseUid,
        phone: s.phone,
        profile: s.profile,
        authScreen: s.authScreen === 'app' ? 'app' : 'splash',
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
