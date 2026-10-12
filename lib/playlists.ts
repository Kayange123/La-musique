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

export const createPlaylist = async (supabase: Client, name: string) => {
  const { data, error } = await supabase
    .from("playlists")
    .insert({ name: cleanPlaylistName(name) })
    .select("id")
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data.id;
};

export const renamePlaylist = async (
  supabase: Client,
  playlistId: number,
  name: string,
) => {
  const result = await supabase
    .from("playlists")
    .update({ name: cleanPlaylistName(name) })
    .eq("id", playlistId)
    .select("id");
  expectRows(result, "Couldn't rename this playlist");
};

export const deletePlaylist = async (supabase: Client, playlistId: number) => {
  const result = await supabase
    .from("playlists")
    .delete()
    .eq("id", playlistId)
    .select("id");
  expectRows(result, "Couldn't delete this playlist");
};

export const addSongToPlaylist = async (
  supabase: Client,
  playlistId: number,
  songId: number,
) => {
  const { error } = await supabase
    .from("playlist_songs")
    .insert({ playlist_id: playlistId, song_id: songId });
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
  playlistId: number,
  songId: number,
) => {
  const result = await supabase
    .from("playlist_songs")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("song_id", songId)
    .select("song_id");
  expectRows(result, "Couldn't remove this song");
};
