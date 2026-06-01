-- ============================================================
-- Migration 004: Shared Vault Access
-- ============================================================
-- This vault is for a single family. All authenticated users
-- (parents, guardians, grandparents) share access to all data.
-- Removes per-user data isolation so everyone sees and can
-- edit/delete the same records.
-- ============================================================

-- Drop old per-user RLS policies
DROP POLICY IF EXISTS "Users can CRUD own child profiles"   ON child_profiles;
DROP POLICY IF EXISTS "Users can CRUD own events"           ON events;
DROP POLICY IF EXISTS "Users can CRUD own event images"     ON event_images;
DROP POLICY IF EXISTS "Users can CRUD own albums"           ON albums;
DROP POLICY IF EXISTS "Users can CRUD own photos"           ON photos;
DROP POLICY IF EXISTS "Users can CRUD own vaccines"         ON vaccines;
DROP POLICY IF EXISTS "Users can CRUD own doctor visits"    ON doctor_visits;
DROP POLICY IF EXISTS "Users can CRUD own growth logs"      ON growth_logs;
DROP POLICY IF EXISTS "Users can CRUD own ledger entries"   ON ledger_entries;
DROP POLICY IF EXISTS "Users can CRUD own blog posts"       ON blog_posts;

-- Create new shared-access policies (any authenticated user)
CREATE POLICY "Authenticated users can CRUD child profiles"
  ON child_profiles FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD events"
  ON events FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD event images"
  ON event_images FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD albums"
  ON albums FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD photos"
  ON photos FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD vaccines"
  ON vaccines FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD doctor visits"
  ON doctor_visits FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD growth logs"
  ON growth_logs FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD ledger entries"
  ON ledger_entries FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can CRUD blog posts"
  ON blog_posts FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- Storage policies (run in Supabase Dashboard > Storage > Policies)
-- or via SQL Editor:
-- ============================================================
--
-- DROP POLICY IF EXISTS "Users can upload own photos"  ON storage.objects;
-- DROP POLICY IF EXISTS "Users can read own photos"    ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own photos"  ON storage.objects;
--
-- CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Authenticated users can read photos" ON storage.objects FOR SELECT
--   USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Authenticated users can delete photos" ON storage.objects FOR DELETE
--   USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
