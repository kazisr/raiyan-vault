import React from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LedgerEntry } from '@/types/ledger'
import { formatCurrency } from '@/utils/currency'

interface LedgerSummaryProps {
  entries: LedgerEntry[]
}

export function LedgerSummary({ entries }: LedgerSummaryProps) {
  const jpyEntries = entries.filter((e) => e.currency === 'JPY')
  const bdtEntries = entries.filter((e) => e.currency === 'BDT')

  const calcBalance = (es: LedgerEntry[]) => ({
    income: es.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0),
    expense: es.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
  })

  const jpy = calcBalance(jpyEntries)
  const bdt = calcBalance(bdtEntries)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[var(--tertiary)]" />
            Ledger Summary
          </CardTitle>
          <Link href="/ledger" className="text-xs text-[var(--primary)] hover:underline">View all</Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { currency: 'JPY' as const, data: jpy },
          { currency: 'BDT' as const, data: bdt },
        ].map(({ currency, data }) => (
          <div key={currency} className="rounded-[var(--radius-md)] bg-[var(--surface-container)] p-3">
            <p className="text-xs font-semibold text-[var(--on-surface-muted)] mb-2">{currency}</p>
            <div className="flex justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--secondary)]" />
                <div>
                  <p className="text-xs text-[var(--on-surface-muted)]">In</p>
                  <p className="text-sm font-semibold text-[var(--secondary)]">
                    {formatCurrency(data.income, currency)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[var(--error)]" />
                <div>
                  <p className="text-xs text-[var(--on-surface-muted)]">Out</p>
                  <p className="text-sm font-semibold text-[var(--error)]">
                    {formatCurrency(data.expense, currency)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--on-surface-muted)]">Balance</p>
                <p className="text-sm font-bold text-[var(--on-surface)]">
                  {formatCurrency(data.income - data.expense, currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
