import { IPlaylist, ISong } from "@/types";
import { createClient, getUserId } from "@/lib/supabase/server";
import { latestDistinct } from "@/lib/history";

export const getSongs = async (): Promise<ISong[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];

  return data ?? [];
};

export const getSongsByUserId = async () => {
  const supabase = await createClient();

  const userId = await getUserId(supabase);

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.log(error);
  }

  return data ?? [];
};

export const getSongsByTitle = async (title: string) => {
  const supabase = await createClient();
  if (!title) {
    return await getSongs();
  }

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .ilike("title", `%${title}%`)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
};

export const getLikedSongs = async (): Promise<ISong[]> => {
  const supabase = await createClient();

  const userId = await getUserId(supabase);

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("liked_songs")
    .select("*, songs(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data.flatMap((item) => (item.songs ? [item.songs] : []));
};

export const getAccountSummary = async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    return null;
  }

  const [uploads, likes] = await Promise.all([
    supabase
      .from("songs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", claims.sub),
    supabase
      .from("liked_songs")
      .select("song_id", { count: "exact", head: true })
      .eq("user_id", claims.sub),
  ]);

  return {
    email: typeof claims.email === "string" ? claims.email : null,
    uploadCount: uploads.count ?? 0,
    likeCount: likes.count ?? 0,
  };
};

export const getPlaylists = async (): Promise<IPlaylist[]> => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return [];
  }

  // RLS already limits this to the user's playlists; the filter keeps the
  // intent explicit.
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data ?? [];
};

// Returns null for a missing playlist and for someone else's (RLS hides
// it), so the page can't reveal whether a playlist exists.
export const getPlaylist = async (
  playlistId: number,
): Promise<{ playlist: IPlaylist; songs: ISong[] } | null> => {
  const supabase = await createClient();

  const { data: playlist } = await supabase
    .from("playlists")
    .select("*")
    .eq("id", playlistId)
    .maybeSingle();

  if (!playlist) {
    return null;
  }

  const { data: rows } = await supabase
    .from("playlist_songs")
    .select("songs(*)")
    .eq("playlist_id", playlistId)
    .order("added_at", { ascending: true });

  return {
    playlist,
    songs: (rows ?? []).flatMap((row) => (row.songs ? [row.songs] : [])),
  };
};

const RECENTLY_PLAYED = 8;

// The user's most recent distinct songs, newest first. Reads more rows
// than needed because repeats of the same song collapse into one.
export const getRecentlyPlayed = async (): Promise<ISong[]> => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("play_history")
    .select("song_id, songs(*)")
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(RECENTLY_PLAYED * 6);

  if (error || !data) {
    return [];
  }

  return latestDistinct(data, { limit: RECENTLY_PLAYED }).flatMap((row) =>
    row.songs ? [row.songs] : [],
  );
};
