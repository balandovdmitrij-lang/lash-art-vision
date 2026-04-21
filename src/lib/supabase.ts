import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'client' | 'master'

export interface UserProfile {
  id: string
  role: UserRole
  phone: string | null
  name: string
  avatar_url: string | null
  created_at: string
}

export interface FaceAnalysis {
  id: string
  client_id: string
  master_id: string | null
  geometry_json: Record<string, unknown>
  result_json: Record<string, unknown>
  photo_url: string | null
  scheme_url: string | null
  overlay_url: string | null
  master_notes: string | null
  created_at: string
}

export interface Appointment {
  id: string
  client_id: string
  master_id: string
  scheduled_at: string
  status: 'pending' | 'confirmed' | 'done' | 'cancelled'
  analysis_id: string | null
  service: string
  notes: string | null
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  type: 'text' | 'image' | 'analysis_card'
  analysis_id: string | null
  read_at: string | null
  created_at: string
}
