'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Loader2, ShieldCheck, Users, KeyRound, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { usePermissions } from '@/hooks/use-permissions'
import {
  createUserAction,
  deleteUserAction,
  updateUserRoleAction,
  updateRolePermissionsAction,
} from '@/app/actions/user-actions'
import {
  ROLES, PERMISSION_GROUPS, PERMISSION_LABELS, ALL_PERMISSIONS,
} from '@/types/permissions'
import type { UserProfile, Permission } from '@/types/permissions'

const ROLE_COLORS: Record<string, string> = {
  Dad:        'bg-[var(--primary-container)] text-[var(--primary)]',
  Mom:        'bg-[var(--secondary-container)] text-[var(--secondary)]',
  Guardian:   'bg-[var(--tertiary-container)] text-[var(--tertiary)]',
  Grandparent:'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)]',
  Other:      'bg-[var(--surface-container)] text-[var(--on-surface-muted)]',
}

// ── Create user form ─────────────────────────────────────
const createSchema = z.object({
  name:     z.string().min(1, 'Required'),
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  email:    z.string().email('Valid email required'),
  password: z.string().min(8, 'Min 8 characters'),
  role:     z.string().min(1, 'Required'),
})
type CreateForm = z.infer<typeof createSchema>

// ── Users tab ────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register, handleSubmit, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSchema) as any,
  })

  useEffect(() => {
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any).from('user_profiles').select('*').order('created_at').then(
      ({ data }: { data: UserProfile[] }) => { setUsers(data ?? []); setLoading(false) }
    )
  }, [])

  async function onCreateSubmit(data: CreateForm) {
    try {
      await createUserAction(data)
      toast.success(`${data.name} added!`)
      // Refresh list
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: updated } = await (supabase as any).from('user_profiles').select('*').order('created_at')
      setUsers(updated ?? [])
      setCreateOpen(false)
      reset()
    } catch (e: unknown) {
      toast.error((e as Error).message)
    }
  }

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, newRole)
        setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, role: newRole } : u))
        toast.success('Role updated')
      } catch (e: unknown) {
        toast.error((e as Error).message)
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      try {
        await deleteUserAction(deleteTarget.user_id)
        setUsers((prev) => prev.filter((u) => u.user_id !== deleteTarget.user_id))
        toast.success(`${deleteTarget.name} removed`)
        setDeleteTarget(null)
      } catch (e: unknown) {
        toast.error((e as Error).message)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--on-surface-muted)]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--on-surface-muted)]">{users.length} member{users.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Add member
        </Button>
      </div>

      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.user_id} className="group">
            <CardContent className="py-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[var(--primary-container)] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-[var(--primary)]">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--on-surface)] truncate">{u.name}</p>
                  <p className="text-xs text-[var(--on-surface-muted)] truncate">@{u.username} · {u.email}</p>
                </div>

                {/* Role selector */}
                <Select
                  defaultValue={u.role}
                  onValueChange={(v) => handleRoleChange(u.user_id, v)}
                  disabled={u.role === 'Dad' || isPending}
                >
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Delete */}
                {u.role !== 'Dad' && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[var(--error)]"
                    onClick={() => setDeleteTarget(u)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create user dialog */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!v) { setCreateOpen(false); reset() } else setCreateOpen(true) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add family member</DialogTitle>
            <DialogDescription>Create a login for a new member of the family.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full name *</Label>
                <Input placeholder="Mum" {...register('name')} />
                {errors.name && <p className="text-xs text-[var(--error)]">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Username *</Label>
                <Input placeholder="mum_vault" {...register('username')} />
                {errors.username && <p className="text-xs text-[var(--error)]">{errors.username.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" placeholder="mum@family.com" {...register('email')} />
              {errors.email && <p className="text-xs text-[var(--error)]">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Password *</Label>
              <Input type="password" placeholder="Min 8 characters" {...register('password')} />
              {errors.password && <p className="text-xs text-[var(--error)]">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select onValueChange={(v) => setValue('role', v)}>
                <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                <SelectContent>
                  {ROLES.filter((r) => r !== 'Dad').map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-[var(--error)]">{errors.role.message}</p>}
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </Button>
              <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); reset() }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will delete their account and all data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-1">
            <Button variant="destructive" disabled={isPending} onClick={handleDelete}>
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}Remove
            </Button>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Roles tab ────────────────────────────────────────────
function RolesTab() {
  const [selectedRole, setSelectedRole] = useState<string>('Mom')
  const [perms, setPerms] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('role_permissions')
      .select('permission, granted')
      .eq('role', selectedRole)
      .then(({ data }: { data: { permission: string; granted: boolean }[] }) => {
        const map = Object.fromEntries(
          ALL_PERMISSIONS.map((p) => [p, false]) // default all false
        )
        ;(data ?? []).forEach((row) => { map[row.permission] = row.granted })
        setPerms(map)
        setLoading(false)
      })
  }, [selectedRole])

  async function handleSave() {
    setSaving(true)
    try {
      await updateRolePermissionsAction(selectedRole, perms)
      toast.success(`${selectedRole} permissions saved!`)
    } catch (e: unknown) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="space-y-1.5 w-48">
          <Label>Select role to edit</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.filter((r) => r !== 'Dad').map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-[var(--on-surface-muted)] mt-5">
          Dad always has full access and cannot be modified.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--on-surface-muted)]" />
        </div>
      ) : (
        <div className="space-y-3">
          {PERMISSION_GROUPS.map((group) => (
            <Card key={group.label}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm font-semibold">{group.label}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-3">
                {group.permissions.map((perm: Permission) => (
                  <div key={perm} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--on-surface-variant)]">
                      {PERMISSION_LABELS[perm]}
                    </span>
                    <Switch
                      checked={perms[perm] ?? false}
                      onCheckedChange={(v) => setPerms((prev) => ({ ...prev, [perm]: v }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save {selectedRole} permissions
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────
export default function AdminPage() {
  const { hasPermission, loaded } = usePermissions()

  if (!loaded) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--on-surface-muted)]" />
      </div>
    )
  }

  if (!hasPermission('manage_users')) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <ShieldCheck className="w-12 h-12 mx-auto text-[var(--on-surface-muted)] mb-4" />
        <h2 className="text-lg font-semibold text-[var(--on-surface)]">Access denied</h2>
        <p className="text-sm text-[var(--on-surface-muted)] mt-1">
          Only Dad can access the admin panel.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--on-surface)] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
          Admin Panel
        </h2>
        <p className="text-sm text-[var(--on-surface-muted)]">Manage family members and access control</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />Role Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
