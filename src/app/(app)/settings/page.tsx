'use client'

import React, { useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor, LogOut, Download, Shield, User, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { UserProfileCard } from '@/components/user/user-profile-card'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error('Failed to sign out'); setSigningOut(false); return }
    toast.info('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--on-surface)]">Settings</h2>
        <p className="text-sm text-[var(--on-surface-muted)]">Manage your preferences and account</p>
      </div>

      {/* User profile */}
      <UserProfileCard />

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the vault looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] border-2 transition-colors ${
                  theme === value
                    ? 'border-[var(--primary)] bg-[var(--primary-container)]'
                    : 'border-[var(--outline-variant)] hover:bg-[var(--surface-container)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${theme === value ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`} />
                <span className={`text-xs font-medium ${theme === value ? 'text-[var(--primary)]' : 'text-[var(--on-surface-variant)]'}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[var(--on-surface)]">Sign out</p>
              <p className="text-xs text-[var(--on-surface-muted)]">End your current session</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} disabled={signingOut}>
              {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[var(--on-surface)]">Private vault</p>
              <p className="text-xs text-[var(--on-surface-muted)]">Only authenticated family members can access this vault</p>
            </div>
            <Switch checked disabled />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[var(--on-surface)]">Row Level Security</p>
              <p className="text-xs text-[var(--on-surface-muted)]">Data is secured at the database level</p>
            </div>
            <Switch checked disabled />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-4 h-4" />Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-[var(--on-surface)]">Export data</p>
              <p className="text-xs text-[var(--on-surface-muted)]">Download all vault data as JSON</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <div className="text-center text-xs text-[var(--on-surface-muted)] pb-4">
        <p>Raiyan&apos;s Vault · Built with love ❤️</p>
        <p className="mt-0.5">A private digital archive for the family</p>
      </div>
    </div>
  )
}
