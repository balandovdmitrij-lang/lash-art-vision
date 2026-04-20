import { create } from 'zustand'

export type Screen = 'onboarding' | 'prepare' | 'camera' | 'validation' | 'analysis' | 'preferences' | 'result' | 'chat'

export interface EyeParams {
  shape: 'round' | 'almond' | 'narrow'
  axis: 'upturned' | 'downturned' | 'straight'
  spacing: 'close' | 'normal' | 'wide'
  hooding: 'center' | 'diagonal' | 'none'
  depth: 'deep' | 'normal' | 'convex'
  symmetry: number
}

export interface LashRecommendation {
  effectName: string
  effectDescription: string
  zones: { zone: number; length: number }[]
  curl: string
  volume: string
  color: string
  forbidden: string[]
  aiMessage: string
}

export interface UserPreferences {
  style: 'bright' | 'natural' | null
  density: 'dense' | 'sparse' | null
  length: 'short' | 'medium' | 'long' | null
}

interface AppState {
  screen: Screen
  photoUrl: string | null
  eyeParams: EyeParams | null
  recommendation: LashRecommendation | null
  preferences: UserPreferences
  chatHistory: { role: 'user' | 'assistant'; content: string }[]
  isLoading: boolean

  setScreen: (screen: Screen) => void
  setPhoto: (url: string) => void
  setEyeParams: (params: EyeParams) => void
  setRecommendation: (rec: LashRecommendation) => void
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  addChatMessage: (msg: { role: 'user' | 'assistant'; content: string }) => void
  setLoading: (v: boolean) => void
  reset: () => void
}

export const useAppStore = create<AppState>((set) => ({
  screen: 'onboarding',
  photoUrl: null,
  eyeParams: null,
  recommendation: null,
  preferences: { style: null, density: null, length: null },
  chatHistory: [],
  isLoading: false,

  setScreen: (screen) => set({ screen }),
  setPhoto: (url) => set({ photoUrl: url }),
  setEyeParams: (params) => set({ eyeParams: params }),
  setRecommendation: (rec) => set({ recommendation: rec }),
  setPreference: (key, value) =>
    set((s) => ({ preferences: { ...s.preferences, [key]: value } })),
  addChatMessage: (msg) =>
    set((s) => ({ chatHistory: [...s.chatHistory, msg] })),
  setLoading: (v) => set({ isLoading: v }),
  reset: () =>
    set({
      screen: 'prepare',
      photoUrl: null,
      eyeParams: null,
      recommendation: null,
      preferences: { style: null, density: null, length: null },
      chatHistory: [],
    }),
}))
