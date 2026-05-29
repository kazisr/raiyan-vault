export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      child_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          date_of_birth: string
          blood_group: string | null
          birth_weight_kg: number | null
          birth_height_cm: number | null
          notes: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['child_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['child_profiles']['Insert']>
      }
      events: {
        Row: {
          id: string
          child_id: string
          user_id: string
          title: string
          description: string | null
          event_date: string
          event_type: string
          mood: string | null
          location: string | null
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_images: {
        Row: {
          id: string
          event_id: string
          storage_path: string
          caption: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['event_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['event_images']['Insert']>
      }
      albums: {
        Row: {
          id: string
          child_id: string
          user_id: string
          name: string
          description: string | null
          cover_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['albums']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['albums']['Insert']>
      }
      photos: {
        Row: {
          id: string
          album_id: string
          child_id: string
          user_id: string
          storage_path: string
          caption: string | null
          taken_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['photos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['photos']['Insert']>
      }
      vaccines: {
        Row: {
          id: string
          child_id: string
          user_id: string
          name: string
          dose: string | null
          administered_date: string
          next_due_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vaccines']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vaccines']['Insert']>
      }
      doctor_visits: {
        Row: {
          id: string
          child_id: string
          user_id: string
          doctor_name: string
          hospital: string | null
          visit_date: string
          diagnosis: string | null
          prescription_path: string | null
          cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['doctor_visits']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['doctor_visits']['Insert']>
      }
      growth_logs: {
        Row: {
          id: string
          child_id: string
          user_id: string
          log_date: string
          weight_kg: number | null
          height_cm: number | null
          head_circumference_cm: number | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['growth_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['growth_logs']['Insert']>
      }
      ledger_entries: {
        Row: {
          id: string
          child_id: string
          user_id: string
          type: 'income' | 'expense'
          amount: number
          currency: 'JPY' | 'BDT'
          converted_amount: number | null
          source_person: string | null
          category: string
          description: string | null
          entry_date: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ledger_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ledger_entries']['Insert']>
      }
      blog_posts: {
        Row: {
          id: string
          child_id: string
          user_id: string
          title: string
          content: string
          cover_image_path: string | null
          tags: string[]
          status: 'draft' | 'published'
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
