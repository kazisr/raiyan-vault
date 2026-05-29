'use client'

import { useState } from 'react'
import { GitCommitHorizontal, Eye, EyeOff } from 'lucide-react'
import { formatCurrency } from '@/utils/currency'
import type { Currency } from '@/utils/currency'

interface Balance {
  currency: Currency
  balance: number
}

interface Props {
  balances: Balance[]
}

export function BalanceSection({ balances }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <GitCommitHorizontal className="w-3.5 h-3.5" />
          <h2>git stash // baby_funds</h2>
        </div>
        <button
          onClick={() => setVisible((v) => !v)}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label={visible ? 'Hide balances' : 'Show balances'}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 border border-gray-100 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
        {balances.map(({ currency, balance }) => (
          <div key={currency} className="first:border-r border-gray-100 dark:border-gray-800 first:pr-4 last:pl-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">{currency}</p>
            {visible ? (
              <>
                <p className={`text-xl font-semibold tracking-tight ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(Math.abs(balance), currency)}
                </p>
                {balance < 0 && (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded mt-1">
                    Deficit
                  </span>
                )}
              </>
            ) : (
              <p className="text-xl font-semibold tracking-tight text-gray-400 dark:text-gray-600 select-none">
                *** ***
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
