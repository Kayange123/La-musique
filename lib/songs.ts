import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

type Client = SupabaseClient<Database>;

// Deletes the row first: RLS only matches the owner's songs, so an empty
// result means it wasn't theirs. Likes go with it through the foreign
// key's on delete cascade. Returns the storage paths to clean up.
const deleteSongRow = async (supabase: Client, songId: number) => {
  const { data, error } = await supabase
    .from("songs")
    .delete()
    .eq("id", songId)
    .select("song_path, image_path");
  if (error) {
    throw new Error(error.message);
  }
  if (!data?.length) {
    throw new Error("Couldn't delete this song");
  }
  return data[0];
};

const removeFile = async (
  supabase: Client,
  bucket: "songs" | "images",
  path: string | null,
) => {
  if (!path) {
    return;
  }
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    // The song is already gone from the app; a leftover file is harmless.
    console.error(`Song deleted but ${bucket}/${path} remains`, error);
  }
};

export const deleteOwnSong = async (supabase: Client, songId: number) => {
  const paths = await deleteSongRow(supabase, songId);
  await Promise.all([
    removeFile(supabase, "songs", paths.song_path),
    removeFile(supabase, "images", paths.image_path),
  ]);
};
