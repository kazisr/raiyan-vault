export const ALL_PERMISSIONS = [
  'upload_pictures',
  'delete_pictures',
  'add_events',
  'edit_events',
  'delete_events',
  'view_medical',
  'add_medical',
  'delete_medical',
  'add_vaccine',
  'edit_vaccine',
  'delete_vaccine',
  'view_ledger',
  'add_ledger',
  'edit_ledger',
  'delete_ledger',
  'add_blog',
  'edit_blog',
  'delete_blog',
  'manage_users',
] as const

export type Permission = typeof ALL_PERMISSIONS[number]

export const PERMISSION_LABELS: Record<Permission, string> = {
  upload_pictures: 'Upload pictures',
  delete_pictures: 'Delete pictures',
  add_events:      'Add timeline events',
  edit_events:     'Edit timeline events',
  delete_events:   'Delete timeline events',
  view_medical:    'View medical records',
  add_medical:     'Add medical records',
  delete_medical:  'Delete medical records',
  add_vaccine:     'Add vaccines',
  edit_vaccine:    'Edit vaccines',
  delete_vaccine:  'Delete vaccines',
  view_ledger:     'View ledger',
  add_ledger:      'Add ledger entries',
  edit_ledger:     'Edit ledger entries',
  delete_ledger:   'Delete ledger entries',
  add_blog:        'Write blog posts',
  edit_blog:       'Edit blog posts',
  delete_blog:     'Delete blog posts',
  manage_users:    'Manage users & roles',
}

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: 'Gallery',   permissions: ['upload_pictures', 'delete_pictures'] },
  { label: 'Timeline',  permissions: ['add_events', 'edit_events', 'delete_events'] },
  { label: 'Medical',   permissions: ['view_medical', 'add_medical', 'delete_medical'] },
  { label: 'Vaccines',  permissions: ['add_vaccine', 'edit_vaccine', 'delete_vaccine'] },
  { label: 'Ledger',    permissions: ['view_ledger', 'add_ledger', 'edit_ledger', 'delete_ledger'] },
  { label: 'Blog',      permissions: ['add_blog', 'edit_blog', 'delete_blog'] },
  { label: 'Admin',     permissions: ['manage_users'] },
]

export interface UserProfile {
  id: string
  user_id: string
  name: string
  username: string
  email: string
  role: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export const ROLES = ['Dad', 'Mom', 'Guardian', 'Grandparent', 'Other'] as const
export type Role = typeof ROLES[number]

export const NAV_PERMISSION_MAP: Partial<Record<string, Permission>> = {
  '/medical': 'view_medical',
  '/ledger':  'view_ledger',
  '/admin':   'manage_users',
}
