-- Accept more audio formats in the songs bucket, and raise the size limit
-- to 50MB (the per-file maximum on Supabase's free plan) for WAV and FLAC.
-- The app uploads each format with one canonical content type
-- (lib/upload.ts AUDIO_FORMATS), so only those are listed.
update storage.buckets
set
  allowed_mime_types = array[
    'audio/mpeg',
    'audio/mp4',
    'audio/aac',
    'audio/wav',
    'audio/ogg',
    'audio/flac'
  ],
  file_size_limit = 52428800
where id = 'songs';
