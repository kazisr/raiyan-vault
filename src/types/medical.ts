import type { Database } from './database'

export type Vaccine = Database['public']['Tables']['vaccines']['Row']
export type VaccineInsert = Database['public']['Tables']['vaccines']['Insert']

export type DoctorVisit = Database['public']['Tables']['doctor_visits']['Row']
export type DoctorVisitInsert = Database['public']['Tables']['doctor_visits']['Insert']

export type GrowthLog = Database['public']['Tables']['growth_logs']['Row']
export type GrowthLogInsert = Database['public']['Tables']['growth_logs']['Insert']
