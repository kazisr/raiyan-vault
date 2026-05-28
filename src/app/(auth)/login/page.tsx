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
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold tracking-[-0.3px] text-[var(--on-surface)]">
          Welcome back
        </h2>
        <p className="mt-1.5 text-sm text-[var(--on-surface-variant)]">
          Sign in to access the family vault
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-[var(--on-surface-variant)]">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@family.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-[var(--error)] flex items-center gap-1.5 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-[var(--on-surface-variant)]">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-[var(--primary)] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={[
                'absolute right-3 top-1/2 -translate-y-1/2',
                'w-7 h-7 flex items-center justify-center rounded-full',
                'text-[var(--on-surface-muted)] hover:text-[var(--on-surface-variant)]',
                'hover:bg-[var(--surface-container)] transition-colors duration-150',
              ].join(' ')}
            >
              {showPassword
                ? <EyeOff className="w-4 h-4" />
                : <Eye className="w-4 h-4" />
              }
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[var(--error)] mt-1">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-[var(--radius-lg)] bg-[var(--error-container)] border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--on-error-container)]">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Sign in
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
