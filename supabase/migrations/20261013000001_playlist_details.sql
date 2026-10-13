/**
 * PLAYLIST DETAILS AND ORDER
 * Adds a description and a cover to playlists, and a stored order to the
 * songs in them. Additive only (new nullable or defaulted columns, a
 * trigger and one new policy), so it's safe to push to an existing project.
 */

alter table public.playlists
  add column description text
    check (description is null or char_length(description) <= 300),
  -- A file in the images bucket; null means "mosaic of the first songs".
  add column cover_path text;

-- Position within the playlist. Floats, so a song can move between two
-- others by taking the midpoint, without renumbering the rest.
alter table public.playlist_songs
  add column position double precision;

-- Existing songs keep the order they were added in.
update public.playlist_songs ps
set position = ordered.rn
from (
  select playlist_id, song_id,
    row_number() over (partition by playlist_id order by added_at, song_id) as rn
  from public.playlist_songs
) ordered
where ps.playlist_id = ordered.playlist_id and ps.song_id = ordered.song_id;

-- Inserts that don't give a position get the 'Infinity' placeholder,
-- which the trigger below replaces with "after the last song". The
-- default also tells generated types that position is optional on insert.
alter table public.playlist_songs
  alter column position set default 'Infinity',
  alter column position set not null,
  add constraint playlist_songs_position_finite
    check (position < 'Infinity' and position > '-Infinity');

-- New songs go to the end of the playlist.
create function public.playlist_songs_set_position()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.position = 'Infinity' then
    select coalesce(max(position), 0) + 1 into new.position
    from public.playlist_songs
    where playlist_id = new.playlist_id;
  end if;
  return new;
end;
$$;

-- BEFORE triggers run ahead of constraint checks, so the placeholder is
-- replaced before the finite check sees it.
create trigger playlist_songs_position
  before insert on public.playlist_songs
  for each row execute procedure public.playlist_songs_set_position();

create index playlist_songs_order_idx
  on public.playlist_songs (playlist_id, position);

/**
 * Reordering: owners may update rows in their own playlists, and only
 * the position column. Moving a row to another playlist would need
 * update on playlist_id, which isn't granted.
 */
create policy "Users can reorder songs in their own playlists."
  on public.playlist_songs for update
  using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.user_id = (select auth.uid())
    )
  );

revoke update on public.playlist_songs from anon, authenticated;
grant update (position) on public.playlist_songs to authenticated;
