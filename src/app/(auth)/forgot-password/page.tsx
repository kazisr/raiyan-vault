'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
  })

  async function onSubmit(data: Form) {
    setServerError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/settings?tab=security`,
    })
    if (error) { setServerError(error.message); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--primary-container)] flex items-center justify-center mx-auto text-3xl">📬</div>
        <h2 className="text-xl font-bold text-[var(--on-surface)]">Email sent</h2>
        <p className="text-sm text-[var(--on-surface-variant)]">Check your inbox for a password reset link.</p>
        <Link href="/login" className="text-sm text-[var(--primary)] hover:underline block">Back to login</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">Reset password</h2>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Enter your email and we&apos;ll send a reset link
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@family.com" {...register('email')} />
          {errors.email && <p className="text-xs text-[var(--error)]">{errors.email.message}</p>}
        </div>
        {serverError && (
          <div className="rounded-[var(--radius-md)] bg-[var(--error-container)] p-3 text-sm text-[var(--on-error-container)]">{serverError}</div>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
      <Link href="/login" className="flex items-center gap-1.5 text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to login
      </Link>
    </div>
  )
}
