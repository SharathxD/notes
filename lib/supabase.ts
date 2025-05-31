import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  })
  throw new Error("Missing Supabase credentials")
}

console.log('Initializing Supabase client ')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

// Test the connection
async function testConnection() {
  try {
    const { data, error } = await supabase.from('notes').select('count').single()
    if (error) {
      console.error('Supabase connection test failed:', error)
    } else {
      console.log('Supabase connection test successful:', data)
    }
  } catch (error: unknown) {
    console.error('Supabase connection test error:', error)
  }
}

testConnection()

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
