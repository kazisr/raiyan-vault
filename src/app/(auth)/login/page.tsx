'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, AtSign, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { CHILD_NICKNAME } from '@/constants/child'

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Enter your email or username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

async function resolveEmail(input: string): Promise<string | null> {
  if (input.includes('@')) return input
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any).rpc('get_email_by_username', { p_username: input })
  return data ?? null
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [navigating, setNavigating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema) as any,
  })

  const loading = isSubmitting || navigating

  async function onSubmit(data: LoginForm) {
    const email = await resolveEmail(data.emailOrUsername.trim().toLowerCase())
    if (!email) {
      toast.error('Username not found')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password: data.password })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Welcome back!')
    setNavigating(true)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative space-y-6">

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 -m-6 sm:-m-8 bg-[var(--surface-container-low)]/80 backdrop-blur-[2px] rounded-[var(--radius-2xl)] flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          <p className="text-sm font-medium text-[var(--on-surface-variant)]">
            {navigating ? 'Opening vault…' : 'Signing in…'}
          </p>
        </div>
      )}

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

        {/* Email or username */}
        <div className="space-y-1.5">
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-muted)] pointer-events-none" />
            <Input
              id="emailOrUsername"
              type="text"
              placeholder="Email or username"
              autoComplete="username"
              className={`pl-10 ${errors.emailOrUsername ? 'border-[var(--error)] focus:ring-[var(--error)]/30' : ''}`}
              {...register('emailOrUsername')}
            />
          </div>
          {errors.emailOrUsername && (
            <p className="text-xs text-[var(--error)] flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.emailOrUsername.message}
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
            <Link href="/forgot-password" className="text-xs text-[var(--primary)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
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

      <div className="text-center">
        <Link
          href="/"
          className="text-sm text-[var(--on-surface-muted)] hover:text-[var(--on-surface-variant)] hover:underline"
        >
          ← View Raiyan&apos;s public page
        </Link>
      </div>
    </div>
