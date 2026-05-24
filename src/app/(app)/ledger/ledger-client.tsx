'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, TrendingUp, TrendingDown, Wallet, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, CURRENCY_SYMBOLS } from '@/utils/currency'
import { formatDate } from '@/utils/age'
import { LEDGER_CATEGORIES } from '@/types/ledger'
import type { LedgerEntry } from '@/types/ledger'
import dayjs from 'dayjs'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().min(1, 'Required'),
  currency: z.enum(['JPY', 'BDT']),
  source_person: z.string().optional(),
  category: z.string().min(1),
  description: z.string().optional(),
  entry_date: z.string().min(1),
})
type FormData = z.infer<typeof schema>

interface LedgerClientProps {
  entries: LedgerEntry[]
  userId: string
}

export function LedgerClient({ entries: initEntries, userId }: LedgerClientProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>(initEntries)
  const [open, setOpen] = useState(false)
  const [currencyFilter, setCurrencyFilter] = useState<'JPY' | 'BDT'>('JPY')

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { type: 'expense', currency: 'JPY', entry_date: new Date().toISOString().split('T')[0], category: 'Other' },
  })
  const supabase = createClient()

  async function onSubmit(data: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: entry } = await supabase
      .from('ledger_entries')
      .insert({ ...data, amount: Number(data.amount), user_id: userId, child_id: userId } as any)
      .select().single()
    if (entry) setEntries((prev) => [entry, ...prev])
    reset(); setOpen(false)
  }

  const filtered = entries.filter((e) => e.currency === currencyFilter)
  const income = filtered.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense = filtered.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance = income - expense

  const monthlyData = filtered.reduce<Record<string, { month: string; income: number; expense: number }>>((acc, e) => {
    const month = dayjs(e.entry_date).format('MMM YY')
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 }
    acc[month][e.type] += e.amount
    return acc
  }, {})
  const chartData = Object.values(monthlyData).slice(-6)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">Financial Ledger</h2>
          <p className="text-sm text-[var(--on-surface-muted)]">Track expenses and income</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> Add entry
        </Button>
      </div>

      {/* Currency toggle */}
      <div className="flex gap-2">
        {(['JPY', 'BDT'] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCurrencyFilter(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currencyFilter === c
                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                : 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)]'
            }`}
          >
            {CURRENCY_SYMBOLS[c]} {c}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowUpRight className="w-4 h-4 text-[var(--secondary)]" />
              <p className="text-xs text-[var(--on-surface-muted)]">Income</p>
            </div>
            <p className="text-lg font-bold text-[var(--secondary)]">{formatCurrency(income, currencyFilter)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ArrowDownRight className="w-4 h-4 text-[var(--error)]" />
              <p className="text-xs text-[var(--on-surface-muted)]">Expense</p>
            </div>
            <p className="text-lg font-bold text-[var(--error)]">{formatCurrency(expense, currencyFilter)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="w-4 h-4 text-[var(--primary)]" />
              <p className="text-xs text-[var(--on-surface-muted)]">Balance</p>
            </div>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-[var(--secondary)]' : 'text-[var(--error)]'}`}>
              {formatCurrency(Math.abs(balance), currencyFilter)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle>Monthly Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--on-surface-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--on-surface-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: '8px', fontSize: 12 }} />
                <Bar dataKey="income" fill="var(--secondary)" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="var(--error)" radius={[4, 4, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">💴</div>
          <p className="text-sm text-[var(--on-surface-variant)]">No {currencyFilter} entries yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    entry.type === 'income' ? 'bg-[var(--secondary-container)]' : 'bg-[var(--error-container)]'
                  }`}>
                    {entry.type === 'income'
                      ? <TrendingUp className="w-4 h-4 text-[var(--secondary)]" />
                      : <TrendingDown className="w-4 h-4 text-[var(--error)]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--on-surface)]">
                        {entry.description ?? entry.category}
                      </p>
                      <Badge variant="surface" className="text-xs">{entry.category}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--on-surface-muted)] mt-0.5">
                      <span>{formatDate(entry.entry_date)}</span>
                      {entry.source_person && <span>· by {entry.source_person}</span>}
                    </div>
                  </div>
                  <p className={`text-sm font-bold flex-shrink-0 ${
                    entry.type === 'income' ? 'text-[var(--secondary)]' : 'text-[var(--error)]'
                  }`}>
                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount, entry.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add ledger entry</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Controller control={control} name="type" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <Controller control={control} name="currency" render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JPY">¥ JPY</SelectItem>
                      <SelectItem value="BDT">৳ BDT</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount *</Label>
                <Input type="number" step="0.01" placeholder="5000" {...register('amount')} />
                {errors.amount && <p className="text-xs text-[var(--error)]">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" {...register('entry_date')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Controller control={control} name="category" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEDGER_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label>From/By person</Label>
              <Input placeholder="Kazi, Grandma, Hospital..." {...register('source_person')} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} {...register('description')} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}Save
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
