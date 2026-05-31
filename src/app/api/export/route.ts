import JSZip from 'jszip'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const TABLES = [
  'child_profiles',
  'events',
  'event_images',
  'albums',
  'photos',
  'vaccines',
  'doctor_visits',
  'growth_logs',
  'ledger_entries',
  'blog_posts',
  'user_profiles',
  'role_permissions',
] as const

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  const { data: profile } = await admin
    .from('user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  // null profile = bootstrap / first user → treat as admin
  if (profile !== null && profile.role !== 'Dad') {
    return Response.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const zip = new JSZip()
  const dataFolder = zip.folder('data')!
  const imagesFolder = zip.folder('images')!

  // ── Export all tables ──────────────────────────────────────
  await Promise.all(
    TABLES.map(async (table) => {
      const { data, error } = await admin.from(table).select('*')
      if (!error) {
        dataFolder.file(`${table}.json`, JSON.stringify(data ?? [], null, 2))
      }
    })
  )

  // ── Export storage images ──────────────────────────────────
  try {
    const { data: buckets } = await admin.storage.listBuckets()
    for (const bucket of buckets ?? []) {
      const bucketFolder = imagesFolder.folder(bucket.name)!
      await downloadBucketFiles(admin, bucket.name, '', bucketFolder)
    }
  } catch {
    // storage may not be configured; continue without images
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  })

  const today = new Date().toISOString().split('T')[0]
  return new Response(zipBlob, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="vault-export-${today}.zip"`,
    },
  })
}

async function downloadBucketFiles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  bucket: string,
  prefix: string,
  folder: JSZip,
) {
  const { data: items } = await admin.storage.from(bucket).list(prefix || undefined, { limit: 1000 })
  for (const item of items ?? []) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id === null) {
      // directory
      const subFolder = folder.folder(item.name)!
      await downloadBucketFiles(admin, bucket, fullPath, subFolder)
    } else {
      const { data } = await admin.storage.from(bucket).download(fullPath)
      if (data) {
        const arrayBuffer = await (data as Blob).arrayBuffer()
        folder.file(item.name, arrayBuffer)
      }
    }
  }
}
