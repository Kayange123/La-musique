-- Block SVG (and any other non-raster type) in the images bucket.
-- SVG can carry scripts that run when its public URL is opened directly.
-- Kept separate from the initial schema so it also applies to projects
-- where that migration was marked as applied instead of pushed.
update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'images';
