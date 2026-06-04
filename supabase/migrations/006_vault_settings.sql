-- vault_settings: singleton row storing which photo is the profile/cover
CREATE TABLE IF NOT EXISTS vault_settings (
  id                  SMALLINT PRIMARY KEY DEFAULT 1,
  profile_photo_id    UUID REFERENCES photos(id) ON DELETE SET NULL,
  profile_photo_path  TEXT,
  cover_photo_id      UUID REFERENCES photos(id) ON DELETE SET NULL,
  cover_photo_path    TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure the singleton row exists
INSERT INTO vault_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS: anyone (anon + authenticated) can read; writes go via service role
ALTER TABLE vault_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vault settings"
  ON vault_settings FOR SELECT
  USING (true);
