-- Add is_featured flag to photos for dashboard carousel
ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_photos_is_featured ON photos(is_featured) WHERE is_featured = true;
