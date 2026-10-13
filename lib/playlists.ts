import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

type Client = SupabaseClient<Database>;

// Postgres unique violation: the song is already in the playlist.
const UNIQUE_VIOLATION = "23505";

export const MAX_PLAYLIST_NAME = 100;

// Same rule as the database check: 1 to 100 characters after trimming.
export const cleanPlaylistName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Give the playlist a name");
  }
  if (trimmed.length > MAX_PLAYLIST_NAME) {
    throw new Error(`Keep the name under ${MAX_PLAYLIST_NAME} characters`);
  }
  return trimmed;
};

// Writes go through RLS, which only matches the owner's playlists. An
// update or delete that matches nothing therefore means "not yours" (or
// gone), and is reported as a failure rather than silently succeeding.
const expectRows = (
  result: { data: unknown[] | null; error: { message: string } | null },
  failure: string,
) => {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data?.length) {
    throw new Error(failure);
  }
};

// Named fields so ids can't be swapped: playlist and song ids are both
// numbers.
type PlaylistRef = { id: number };
type PlaylistEntry = { playlistId: number; songId: number };

export const createPlaylist = async (
  supabase: Client,
  playlist: { name: string },
) => {
  const { data, error } = await supabase
    .from("playlists")
    .insert({ name: cleanPlaylistName(playlist.name) })
    .select("id")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data.id;
};

// Runs an update or delete on one of the user's playlists, failing if RLS
// matched nothing.
export const changeOwnPlaylist = async (
  query: PromiseLike<{
    data: unknown[] | null;
    error: { message: string } | null;
  }>,
  failure: string,
) => expectRows(await query, failure);

export const deletePlaylist = async (
  supabase: Client,
  playlist: PlaylistRef & { cover_path?: string | null },
) => {
  await changeOwnPlaylist(
    supabase.from("playlists").delete().eq("id", playlist.id).select("id"),
    "Couldn't delete this playlist",
  );
  if (playlist.cover_path) {
    // The playlist is gone; a leftover cover file is harmless.
    const { error } = await supabase.storage
      .from("images")
      .remove([playlist.cover_path]);
    if (error) {
      console.error("Playlist deleted but its cover remains", error);
    }
  }
};

export const addSongToPlaylist = async (
  supabase: Client,
  entry: PlaylistEntry,
) => {
  const { error } = await supabase
    .from("playlist_songs")
    .insert({ playlist_id: entry.playlistId, song_id: entry.songId });
  if (error?.code === UNIQUE_VIOLATION) {
    throw new Error("Already in this playlist");
  }
  if (error) {
    throw new Error(error.message);
  }
};

// Only takes the song out of the playlist; the song itself stays.
export const removeSongFromPlaylist = async (
  supabase: Client,
  entry: PlaylistEntry,
) => {
  const result = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", entry.playlistId)
    .eq("song_id", entry.songId)
    .select("song_id");
  expectRows(result, "Couldn't remove this song");
};

// Route params are strings; only positive whole numbers are valid ids.
export const parsePlaylistId = (value: string): number | null =>
  /^[1-9]\d{0,15}$/.test(value) ? Number(value) : null;

export const listPlaylists = async (supabase: Client, user: { id: string }) => {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
};
