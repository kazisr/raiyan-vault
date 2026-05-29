'use client'

import { usePermissions } from '@/hooks/use-permissions'
import type { Permission } from '@/types/permissions'

interface PermissionGateProps {
  permission: Permission
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission, loaded } = usePermissions()
  if (!loaded) return null
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>
}
