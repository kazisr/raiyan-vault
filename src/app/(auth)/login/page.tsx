'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CHILD_NICKNAME } from '@/constants/child'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema) as any,
  })

  async function onSubmit(data: LoginForm) {
    setServerError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="space-y-6">

      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--on-surface)]">
          Welcome back
        </h2>
        <p className="text-sm text-[var(--on-surface-variant)]">
          Sign in to {CHILD_NICKNAME}&apos;s Vault
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

        {/* Email */}
        <div className="space-y-1.5">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-muted)] pointer-events-none" />
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              className={`pl-10 ${errors.email ? 'border-[var(--error)] focus:ring-[var(--error)]/30' : ''}`}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-[var(--error)] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-muted)] pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              autoComplete="current-password"
              className={`pl-10 pr-11 ${errors.password ? 'border-[var(--error)] focus:ring-[var(--error)]/30' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full text-[var(--on-surface-muted)] hover:text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[var(--error)] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.password.message}
            </p>
          )}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--primary)] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-[var(--radius-lg)] bg-[var(--error-container)] border border-[var(--error)]/20 px-4 py-3">
            <AlertCircle className="w-4 h-4 text-[var(--error)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--on-error-container)]">{serverError}</p>
          </div>
        )}

        {/* Submit */}
        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--on-surface-variant)]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
