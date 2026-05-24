'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const signupSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver: zodResolver(signupSchema) as any })

  async function onSubmit(data: SignupForm) {
    setServerError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) { setServerError(error.message); return }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--secondary-container)] flex items-center justify-center mx-auto text-3xl">
          ✉️
        </div>
        <h2 className="text-xl font-bold text-[var(--on-surface)]">Check your email</h2>
        <p className="text-sm text-[var(--on-surface-variant)]">
          We sent a confirmation link to your email. Click it to activate your account.
        </p>
        <Link href="/login" className="text-sm text-[var(--primary)] hover:underline block">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--on-surface)]">Create account</h2>
        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
          Set up access to the family vault
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@family.com" {...register('email')} />
          {errors.email && <p className="text-xs text-[var(--error)]">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              className="pr-10"
              {...register('password')}
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--on-surface-muted)]">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-[var(--error)]">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-xs text-[var(--error)]">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && (
          <div className="rounded-[var(--radius-md)] bg-[var(--error-container)] p-3 text-sm text-[var(--on-error-container)]">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--on-surface-variant)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
