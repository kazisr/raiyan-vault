-- ============================================================
-- Security: lock down user_profiles write access
-- All mutations must go through server actions (service role)
-- so the backend can enforce role-change restrictions.
-- ============================================================

-- Remove direct INSERT / UPDATE access for authenticated users.
-- Service role (used by server actions) bypasses RLS, so actions still work.
DROP POLICY IF EXISTS "profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.user_profiles;

-- Read-only stays open so the UI can display names/roles.
-- (The "profiles_select" policy created in 002 is kept as-is.)
