import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          content: string
          device_info: string | null
          device_id: string | null
          created_at: string
          updated_at: string
          is_deleted: boolean
        }
        Insert: {
          id?: string
          title?: string
          content?: string
          device_info?: string | null
          device_id?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
        Update: {
          id?: string
          title?: string
          content?: string
          device_info?: string | null
          device_id?: string | null
          created_at?: string
          updated_at?: string
          is_deleted?: boolean
        }
      }
      devices: {
        Row: {
          id: string
          device_id: string
          device_name: string | null
          device_type: string | null
          last_seen: string
          created_at: string
        }
        Insert: {
          id?: string
          device_id: string
          device_name?: string | null
          device_type?: string | null
          last_seen?: string
          created_at?: string
        }
        Update: {
          id?: string
          device_id?: string
          device_name?: string | null
          device_type?: string | null
          last_seen?: string
          created_at?: string
        }
      }
    }
  }
}
