'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { formatCurrency, type Currency } from '@/utils/currency'
import { formatDate } from '@/utils/age'

interface LedgerEntry {
  id: string
  amount: number
  type: string
  currency: Currency
  category: string
  description: string | null
  entry_date: string
  source_person: string | null
}

interface Props {
  entries: LedgerEntry[]
}

export function LedgerHistory({ entries }: Props) {
  const [open, setOpen] = useState(false)

  if (entries.length === 0) return null

  return (
    <section className="space-y-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Ledger History</span>
          <span className="normal-case font-normal tracking-normal">({entries.length})</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4">
          {(['BDT', 'JPY'] as const).map((currency) => {
            const currencyEntries = entries.filter((e) => e.currency === currency)
            if (currencyEntries.length === 0) return null
            return (
              <div key={currency}>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider">
                  {currency}
                </p>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
                  {currencyEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          entry.type === 'income'
                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400'
                        }`}>
                          {entry.type === 'income'
                            ? <TrendingUp className="w-4 h-4" />
                            : <TrendingDown className="w-4 h-4" />}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {entry.description ?? entry.category}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            <span>{formatDate(entry.entry_date)}</span>
                            {entry.source_person && (
                              <><span>·</span><span>{entry.source_person}</span></>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                        entry.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount, entry.currency)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
