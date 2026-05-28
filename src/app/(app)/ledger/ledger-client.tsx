'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, TrendingUp, TrendingDown, Wallet, Loader2,
  ArrowUpRight, ArrowDownRight, MoreVertical, Pencil, Trash2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
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

const DEFAULT_VALUES: FormData = {
  type: 'expense',
  currency: 'JPY',
  entry_date: new Date().toISOString().split('T')[0],
  category: 'Other',
  amount: '',
  source_person: '',
  description: '',
}

interface LedgerClientProps {
  entries: LedgerEntry[]
  userId: string
}

export function LedgerClient({ entries: initEntries, userId }: LedgerClientProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>(initEntries)
  const [open, setOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LedgerEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currencyFilter, setCurrencyFilter] = useState<'JPY' | 'BDT'>('JPY')

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: DEFAULT_VALUES,
  })
  const supabase = createClient()

  function openAdd() {
    reset(DEFAULT_VALUES)
    setEditingEntry(null)
    setOpen(true)
  }

  function openEdit(entry: LedgerEntry) {
    reset({
      type: entry.type as 'income' | 'expense',
      amount: String(entry.amount),
      currency: entry.currency as 'JPY' | 'BDT',
      source_person: entry.source_person ?? '',
      category: entry.category,
      description: entry.description ?? '',
      entry_date: entry.entry_date,
    })
    setEditingEntry(entry)
    setOpen(true)
  }

  function closeDialog() {
    setOpen(false)
    setEditingEntry(null)
  }

  async function onSubmit(data: FormData) {
    if (editingEntry) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await supabase
        .from('ledger_entries')
        .update({ ...data, amount: Number(data.amount) } as any)
        .eq('id', editingEntry.id)
        .select()
        .single()
      if (updated) setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: entry } = await supabase
        .from('ledger_entries')
        .insert({ ...data, amount: Number(data.amount), user_id: userId, child_id: userId } as any)
        .select()
        .single()
      if (entry) setEntries((prev) => [entry, ...prev])
    }
    closeDialog()
  }

  async function onDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    await supabase.from('ledger_entries').delete().eq('id', deleteTarget.id)
    setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
    setIsDeleting(false)
  }

  const filtered = entries.filter((e) => e.currency === currencyFilter)
  const income = filtered.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense = filtered.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance = income - expense

  const monthlyMap = filtered.reduce<Record<string, { month: string; income: number; expense: number }>>((acc, e) => {
    const month = dayjs(e.entry_date).format('MMM YY')
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 }
    acc[month][e.type] += e.amount
    return acc
  }, {})
  const chartData = Object.values(monthlyMap).slice(-6)

  const groupedEntries = filtered.reduce<Record<string, LedgerEntry[]>>((acc, e) => {
    const key = dayjs(e.entry_date).format('MMMM YYYY')
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">Financial Ledger</h2>
          <p className="text-sm text-[var(--on-surface-muted)]">Track expenses and income</p>
        </div>
        <Button size="sm" onClick={openAdd}>
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
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-[var(--secondary-container)] flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--secondary)]" />
              </div>
              <p className="text-xs text-[var(--on-surface-muted)]">Income</p>
            </div>
            <p className="text-sm font-bold text-[var(--secondary)] leading-tight tabular-nums">
              {formatCurrency(income, currencyFilter)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-[var(--error-container)] flex items-center justify-center flex-shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5 text-[var(--error)]" />
              </div>
              <p className="text-xs text-[var(--on-surface-muted)]">Expenses</p>
            </div>
            <p className="text-sm font-bold text-[var(--error)] leading-tight tabular-nums">
              {formatCurrency(expense, currencyFilter)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-full bg-[var(--primary-container)] flex items-center justify-center flex-shrink-0">
                <Wallet className="w-3.5 h-3.5 text-[var(--primary)]" />
              </div>
              <p className="text-xs text-[var(--on-surface-muted)]">Balance</p>
            </div>
            <p className={`text-sm font-bold leading-tight tabular-nums ${
              balance >= 0 ? 'text-[var(--secondary)]' : 'text-[var(--error)]'
            }`}>
              {balance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(balance), currencyFilter)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--on-surface-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--on-surface-muted)' }} width={42} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-container-low)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: '8px',
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="income" fill="var(--secondary)" radius={[3, 3, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="var(--error)" radius={[3, 3, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface-container-low)] rounded-[var(--radius-xl)]">
          <div className="text-5xl mb-3">💴</div>
          <p className="text-sm font-medium text-[var(--on-surface-variant)]">No {currencyFilter} entries yet</p>
          <p className="text-xs text-[var(--on-surface-muted)] mt-1">Tap &quot;Add entry&quot; to get started</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <div key={month}>
              <div className="flex items-center gap-2 mb-2.5">
                <p className="text-xs font-semibold text-[var(--on-surface-muted)] uppercase tracking-wider whitespace-nowrap">
                  {month}
                </p>
                <div className="flex-1 h-px bg-[var(--outline-variant)]" />
                <Badge variant="surface" className="text-xs tabular-nums">{monthEntries.length}</Badge>
              </div>
              <div className="space-y-2">
                {monthEntries.map((entry) => (
                  <Card key={entry.id} className="group">
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          entry.type === 'income'
                            ? 'bg-[var(--secondary-container)]'
                            : 'bg-[var(--error-container)]'
                        }`}>
                          {entry.type === 'income'
                            ? <TrendingUp className="w-4 h-4 text-[var(--secondary)]" />
                            : <TrendingDown className="w-4 h-4 text-[var(--error)]" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-medium text-[var(--on-surface)] truncate">
                              {entry.description ?? entry.category}
                            </p>
                            {entry.description && (
                              <Badge variant="surface" className="text-xs shrink-0">{entry.category}</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[var(--on-surface-muted)] mt-0.5">
                            <span>{formatDate(entry.entry_date)}</span>
                            {entry.source_person && (
                              <>
                                <span>·</span>
                                <span>{entry.source_person}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <p className={`text-sm font-bold tabular-nums ${
                            entry.type === 'income' ? 'text-[var(--secondary)]' : 'text-[var(--error)]'
                          }`}>
                            {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount, entry.currency)}
                          </p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ml-0.5"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(entry)}>
                                <Pencil className="w-3.5 h-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-[var(--error)] focus:text-[var(--error)]"
                                onClick={() => setDeleteTarget(entry)}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) closeDialog(); else setOpen(true) }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? 'Edit entry' : 'Add ledger entry'}</DialogTitle>
          </DialogHeader>
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
              <Label>From / By person</Label>
              <Input placeholder="Kazi, Grandma, Hospital…" {...register('source_person')} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} placeholder="Optional note…" {...register('description')} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingEntry ? 'Update' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Delete this entry?</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  <span className="font-semibold text-[var(--on-surface)]">
                    {formatCurrency(deleteTarget.amount, deleteTarget.currency)}
                  </span>
                  {' — '}{deleteTarget.description ?? deleteTarget.category}
                  {'. '}This cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-1">
            <Button variant="destructive" disabled={isDeleting} onClick={onDelete}>
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
