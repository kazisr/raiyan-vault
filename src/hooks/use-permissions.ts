import { usePermissionStore } from '@/store/permission-store'
import type { Permission } from '@/types/permissions'

export function usePermissions() {
  const { profile, permissions, loaded } = usePermissionStore()

  function hasPermission(permission: Permission): boolean {
    if (!loaded) return false
    return permissions[permission] === true
  }

  return { profile, permissions, loaded, hasPermission }
}
