-- ============================================================
-- RBAC: user_profiles + role_permissions
-- Run in Supabase SQL Editor after 001 (schema.sql)
-- ============================================================

-- ── user_profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  username    TEXT        UNIQUE NOT NULL,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'Other',
  created_by  UUID        REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id  ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);

-- ── role_permissions ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  role        TEXT        NOT NULL,
  permission  TEXT        NOT NULL,
  granted     BOOLEAN     NOT NULL DEFAULT FALSE,
  updated_by  UUID        REFERENCES auth.users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role, permission)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);

-- ── RLS ────────────────────────────────────────────────────
ALTER TABLE public.user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- user_profiles: authenticated users can read all; create/update own
DROP POLICY IF EXISTS "profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.user_profiles;

CREATE POLICY "profiles_select" ON public.user_profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update" ON public.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- role_permissions: everyone can read; only service role can write
DROP POLICY IF EXISTS "role_perms_select" ON public.role_permissions;

CREATE POLICY "role_perms_select" ON public.role_permissions
  FOR SELECT USING (true);

-- ── RPC: email lookup by username (used for username login) ─
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.user_profiles WHERE lower(username) = lower(p_username) LIMIT 1;
$$;

-- ── Seed default role permissions ──────────────────────────
INSERT INTO public.role_permissions (role, permission, granted) VALUES
  -- Dad: all true (super admin — enforced in app, not just DB)
  ('Dad','upload_pictures',true), ('Dad','delete_pictures',true),
  ('Dad','add_events',true),      ('Dad','edit_events',true),      ('Dad','delete_events',true),
  ('Dad','view_medical',true),    ('Dad','add_medical',true),      ('Dad','delete_medical',true),
  ('Dad','add_vaccine',true),     ('Dad','edit_vaccine',true),     ('Dad','delete_vaccine',true),
  ('Dad','view_ledger',true),     ('Dad','add_ledger',true),       ('Dad','edit_ledger',true),     ('Dad','delete_ledger',true),
  ('Dad','add_blog',true),        ('Dad','edit_blog',true),        ('Dad','delete_blog',true),
  ('Dad','manage_users',true),
  -- Mom: all except manage_users
  ('Mom','upload_pictures',true), ('Mom','delete_pictures',true),
  ('Mom','add_events',true),      ('Mom','edit_events',true),      ('Mom','delete_events',true),
  ('Mom','view_medical',true),    ('Mom','add_medical',true),      ('Mom','delete_medical',true),
  ('Mom','add_vaccine',true),     ('Mom','edit_vaccine',true),     ('Mom','delete_vaccine',true),
  ('Mom','view_ledger',true),     ('Mom','add_ledger',true),       ('Mom','edit_ledger',true),     ('Mom','delete_ledger',true),
  ('Mom','add_blog',true),        ('Mom','edit_blog',true),        ('Mom','delete_blog',true),
  ('Mom','manage_users',false),
  -- Guardian: limited write
  ('Guardian','upload_pictures',true),  ('Guardian','delete_pictures',false),
  ('Guardian','add_events',true),       ('Guardian','edit_events',false),     ('Guardian','delete_events',false),
  ('Guardian','view_medical',true),     ('Guardian','add_medical',false),     ('Guardian','delete_medical',false),
  ('Guardian','add_vaccine',false),     ('Guardian','edit_vaccine',false),    ('Guardian','delete_vaccine',false),
  ('Guardian','view_ledger',false),     ('Guardian','add_ledger',false),      ('Guardian','edit_ledger',false),    ('Guardian','delete_ledger',false),
  ('Guardian','add_blog',false),        ('Guardian','edit_blog',false),       ('Guardian','delete_blog',false),
  ('Guardian','manage_users',false),
  -- Grandparent: view + upload only
  ('Grandparent','upload_pictures',true),  ('Grandparent','delete_pictures',false),
  ('Grandparent','add_events',false),      ('Grandparent','edit_events',false),     ('Grandparent','delete_events',false),
  ('Grandparent','view_medical',false),    ('Grandparent','add_medical',false),     ('Grandparent','delete_medical',false),
  ('Grandparent','add_vaccine',false),     ('Grandparent','edit_vaccine',false),    ('Grandparent','delete_vaccine',false),
  ('Grandparent','view_ledger',false),     ('Grandparent','add_ledger',false),      ('Grandparent','edit_ledger',false),    ('Grandparent','delete_ledger',false),
  ('Grandparent','add_blog',false),        ('Grandparent','edit_blog',false),       ('Grandparent','delete_blog',false),
  ('Grandparent','manage_users',false),
  -- Other: minimal
  ('Other','upload_pictures',false), ('Other','delete_pictures',false),
  ('Other','add_events',false),      ('Other','edit_events',false),     ('Other','delete_events',false),
  ('Other','view_medical',false),    ('Other','add_medical',false),     ('Other','delete_medical',false),
  ('Other','add_vaccine',false),     ('Other','edit_vaccine',false),    ('Other','delete_vaccine',false),
  ('Other','view_ledger',false),     ('Other','add_ledger',false),      ('Other','edit_ledger',false),    ('Other','delete_ledger',false),
  ('Other','add_blog',false),        ('Other','edit_blog',false),       ('Other','delete_blog',false),
  ('Other','manage_users',false)
ON CONFLICT (role, permission) DO NOTHING;
