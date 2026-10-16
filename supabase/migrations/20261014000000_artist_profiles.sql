/**
 * ARTIST PROFILES
 * A public identity for uploaders: handle, display name, bio and avatar.
 * Kept in its own table because public.users holds private billing data
 * and must stay owner-only. Profiles are opt-in; nothing here is derived
 * from email or other account data. New table only, so it's safe to push
 * to an existing project.
 */
create table public.artist_profiles (
  user_id uuid primary key default auth.uid()
    references auth.users on delete cascade,
  -- Used in URLs (/artist/<handle>). Lowercase only, so uniqueness is
  -- case-insensitive by construction.
  handle text not null unique
    check (handle ~ '^[a-z0-9_]{3,30}$'),
  display_name text not null
    check (char_length(btrim(display_name)) between 1 and 60),
  bio text check (bio is null or char_length(bio) <= 500),
  -- A file in the images bucket.
  avatar_path text,
  created_at timestamptz not null default now()
);

alter table public.artist_profiles enable row level security;

-- Anyone, signed in or not, can read profiles.
create policy "Artist profiles are public." on public.artist_profiles
  for select using (true);
create policy "Users can create their own artist profile."
  on public.artist_profiles for insert
  with check ((select auth.uid()) = user_id);
create policy "Users can update their own artist profile."
  on public.artist_profiles for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can delete their own artist profile."
  on public.artist_profiles for delete
  using ((select auth.uid()) = user_id);
