-- ============================================================
-- Raiyan's Vault — Supabase PostgreSQL Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to set up the database.
-- ============================================================

-- ── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── child_profiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS child_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  date_of_birth     DATE NOT NULL,
  blood_group       TEXT,
  birth_weight_kg   NUMERIC(5, 2),
  birth_height_cm   NUMERIC(5, 1),
  notes             TEXT,
  avatar_url        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);

-- ── events ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id      UUID NOT NULL,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  event_date    DATE NOT NULL,
  event_type    TEXT NOT NULL DEFAULT 'milestone',
  mood          TEXT,
  location      TEXT,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_event_date ON events(event_date DESC);

-- ── event_images ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  caption       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_images_event_id ON event_images(event_id);

-- ── albums ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS albums (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id      UUID NOT NULL,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  cover_path    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_albums_user_id ON albums(user_id);

-- ── photos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id      UUID REFERENCES albums(id) ON DELETE SET NULL,
  child_id      UUID NOT NULL,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  caption       TEXT,
  taken_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_album_id ON photos(album_id);

-- ── vaccines ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vaccines (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id          UUID NOT NULL,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  dose              TEXT,
  administered_date DATE NOT NULL,
  next_due_date     DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vaccines_user_id ON vaccines(user_id);
CREATE INDEX idx_vaccines_next_due_date ON vaccines(next_due_date);

-- ── doctor_visits ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_visits (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id          UUID NOT NULL,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name       TEXT NOT NULL,
  hospital          TEXT,
  visit_date        DATE NOT NULL,
  diagnosis         TEXT,
  prescription_path TEXT,
  cost              NUMERIC(10, 2),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctor_visits_user_id ON doctor_visits(user_id);
CREATE INDEX idx_doctor_visits_visit_date ON doctor_visits(visit_date DESC);

-- ── growth_logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS growth_logs (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id                UUID NOT NULL,
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date                DATE NOT NULL,
  weight_kg               NUMERIC(5, 2),
  height_cm               NUMERIC(5, 1),
  head_circumference_cm   NUMERIC(5, 1),
  notes                   TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_growth_logs_user_id ON growth_logs(user_id);
CREATE INDEX idx_growth_logs_log_date ON growth_logs(log_date ASC);

-- ── ledger_entries ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ledger_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id         UUID NOT NULL,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount           NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency         TEXT NOT NULL CHECK (currency IN ('JPY', 'BDT')),
  converted_amount NUMERIC(12, 2),
  source_person    TEXT,
  category         TEXT NOT NULL,
  description      TEXT,
  entry_date       DATE NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ledger_entries_user_id ON ledger_entries(user_id);
CREATE INDEX idx_ledger_entries_entry_date ON ledger_entries(entry_date DESC);
CREATE INDEX idx_ledger_entries_currency ON ledger_entries(currency);

-- ── blog_posts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id          UUID NOT NULL,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  content           TEXT NOT NULL,
  cover_image_path  TEXT,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);

-- ── updated_at triggers ────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['child_profiles','events','albums','vaccines','doctor_visits','ledger_entries','blog_posts']
  LOOP
    EXECUTE format(
      'CREATE OR REPLACE TRIGGER trg_%s_updated_at BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums         ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_visits  ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts     ENABLE ROW LEVEL SECURITY;

-- All authenticated users share access to all vault data (single-family vault)

-- child_profiles
CREATE POLICY "Authenticated users can CRUD child profiles"
  ON child_profiles FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- events
CREATE POLICY "Authenticated users can CRUD events"
  ON events FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- event_images
CREATE POLICY "Authenticated users can CRUD event images"
  ON event_images FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- albums
CREATE POLICY "Authenticated users can CRUD albums"
  ON albums FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- photos
CREATE POLICY "Authenticated users can CRUD photos"
  ON photos FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- vaccines
CREATE POLICY "Authenticated users can CRUD vaccines"
  ON vaccines FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- doctor_visits
CREATE POLICY "Authenticated users can CRUD doctor visits"
  ON doctor_visits FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- growth_logs
CREATE POLICY "Authenticated users can CRUD growth logs"
  ON growth_logs FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ledger_entries
CREATE POLICY "Authenticated users can CRUD ledger entries"
  ON ledger_entries FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- blog_posts
CREATE POLICY "Authenticated users can CRUD blog posts"
  ON blog_posts FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- STORAGE BUCKET (run via Supabase dashboard or CLI)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('photos', 'photos', FALSE, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']);
--
-- All authenticated users share the same storage space (single-family vault).
-- Files are stored under shared/ prefix instead of per-user folders.
--
-- CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Authenticated users can read photos" ON storage.objects FOR SELECT
--   USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
--
-- CREATE POLICY "Authenticated users can delete photos" ON storage.objects FOR DELETE
--   USING (bucket_id = 'photos' AND auth.uid() IS NOT NULL);
