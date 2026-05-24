'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CHILD_NAME, CHILD_DOB } from '@/constants/child'
import type { Child } from '@/types/child'

export function useChild() {
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('child_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setChild(data)
          setLoading(false)
        })
    })
  }, [])

  return {
    child,
    loading,
    name: child?.name ?? CHILD_NAME,
    dob: child?.date_of_birth ?? CHILD_DOB,
  }
}
