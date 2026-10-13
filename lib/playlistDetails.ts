import { SupabaseClient } from "@supabase/supabase-js";
import uniqid from "uniqid";
import { Database } from "@/types_db";
import { changeOwnPlaylist, cleanPlaylistName } from "./playlists";
import { isValidImage } from "./upload";

type Client = SupabaseClient<Database>;
type PlaylistCover = { id: number; cover_path: string | null };

export const MAX_DESCRIPTION = 300;

// Same rule as the database check. Blank means "no description".
export const cleanDescription = (description: string): string | null => {
  const trimmed = description.trim();
  if (trimmed.length > MAX_DESCRIPTION) {
    throw new Error(`Keep the description under ${MAX_DESCRIPTION} characters`);
  }
  return trimmed || null;
};

export const updatePlaylistDetails = (
  supabase: Client,
  details: { id: number; name: string; description: string },
) =>
  changeOwnPlaylist(
    supabase
      .from("playlists")
      .update({
        name: cleanPlaylistName(details.name),
        description: cleanDescription(details.description),
      })
      .eq("id", details.id)
      .select("id"),
    "Couldn't save this playlist",
  );

// Only position is updatable (a column-level grant), and only in the
// user's own playlists (RLS).
export const setSongPosition = (
  supabase: Client,
  entry: { playlistId: number; songId: number; position: number },
) =>
  changeOwnPlaylist(
    supabase
      .from("playlist_songs")
      .update({ position: entry.position })
      .eq("playlist_id", entry.playlistId)
      .eq("song_id", entry.songId)
      .select("song_id"),
    "Couldn't move this song",
  );

const IMAGE_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const removeImage = async (supabase: Client, path: string | null) => {
  if (!path) {
    return;
  }
  const { error } = await supabase.storage.from("images").remove([path]);
  if (error) {
    // The playlist no longer points at it; a leftover file is harmless.
    console.error(`Couldn't remove images/${path}`, error);
  }
};

// Uploads a new cover, points the playlist at it, then removes the old
// one. If the playlist can't be updated, the new file is removed again.
export const setPlaylistCover = async (
  supabase: Client,
  change: { playlist: PlaylistCover; file: File },
) => {
  const { playlist, file } = change;
  if (!isValidImage(file)) {
    throw new Error("Cover must be a JPEG, PNG, WebP or GIF under 5MB");
  }
  const path = `playlist-${playlist.id}-${uniqid()}.${IMAGE_EXTENSIONS.get(file.type)}`;
  const upload = await supabase.storage
    .from("images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) {
    throw new Error(upload.error.message);
  }
  try {
    await changeOwnPlaylist(
      supabase
        .from("playlists")
        .update({ cover_path: path })
        .eq("id", playlist.id)
        .select("id"),
      "Couldn't update this playlist's cover",
    );
  } catch (error) {
    await removeImage(supabase, path);
    throw error;
  }
  await removeImage(supabase, playlist.cover_path);
  return path;
};

// Back to the automatic mosaic.
export const removePlaylistCover = async (
  supabase: Client,
  playlist: PlaylistCover,
) => {
  await changeOwnPlaylist(
    supabase
      .from("playlists")
      .update({ cover_path: null })
      .eq("id", playlist.id)
      .select("id"),
    "Couldn't remove this playlist's cover",
  );
  await removeImage(supabase, playlist.cover_path);
};
