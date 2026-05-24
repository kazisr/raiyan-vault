import type { Database } from './database'

export type LedgerEntry = Database['public']['Tables']['ledger_entries']['Row']
export type LedgerInsert = Database['public']['Tables']['ledger_entries']['Insert']

export type Currency = 'JPY' | 'BDT'
export type LedgerType = 'income' | 'expense'

export const LEDGER_CATEGORIES = [
  'Medical',
  'Clothing',
  'Toys & Books',
  'Food',
  'Education',
  'Travel',
  'Gift',
  'Equipment',
  'Other',
] as const

export type LedgerCategory = (typeof LEDGER_CATEGORIES)[number]
