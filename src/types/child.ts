import type { Database } from './database'

export type Child = Database['public']['Tables']['child_profiles']['Row']
export type ChildInsert = Database['public']['Tables']['child_profiles']['Insert']
export type ChildUpdate = Database['public']['Tables']['child_profiles']['Update']
