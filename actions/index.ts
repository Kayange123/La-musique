import { IArtistProfile, IPlaylist, ISong } from "@/types";
import { createClient, getUserId } from "@/lib/supabase/server";
import { latestDistinct } from "@/lib/history";
import { PlaylistEntry } from "@/lib/playlistOrder";
import { groupReports } from "@/lib/moderation";

export const getSongs = async (): Promise<ISong[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("songs")
    .select("*")
    // Uploaders and admins can read hidden songs, but they don't belong
    // in public lists, even for them.
    .is("hidden_at", null)
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
    .is("hidden_at", null)
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

export interface PlaylistPageData {
  playlist: IPlaylist;
  entries: PlaylistEntry[];
  // One uploaded cover, or up to four song covers for a mosaic.
  coverUrls: string[];
}

// Returns null for a missing playlist and for someone else's (RLS hides
// it), so the page can't reveal whether a playlist exists.
export const getPlaylist = async (
  playlistId: number,
): Promise<PlaylistPageData | null> => {
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
    .select("position, added_at, songs(*)")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });

  const entries: PlaylistEntry[] = (rows ?? []).flatMap((row) =>
    row.songs
      ? [{ song: row.songs, position: row.position, addedAt: row.added_at }]
      : [],
  );

  const publicUrl = (path: string) =>
    supabase.storage.from("images").getPublicUrl(path).data.publicUrl;
  const coverUrls = playlist.cover_path
    ? [publicUrl(playlist.cover_path)]
    : entries
        .flatMap(({ song }) => (song.image_path ? [song.image_path] : []))
        .slice(0, 4)
        .map(publicUrl);

  return { playlist, entries, coverUrls };
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

export interface ArtistPageData {
  profile: IArtistProfile;
  avatarUrl: string | null;
  songs: ISong[];
}

const imageUrl = (
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null,
) =>
  path
    ? supabase.storage.from("images").getPublicUrl(path).data.publicUrl
    : null;

// An artist's public page: their profile and the songs they uploaded.
export const getArtistByHandle = async (
  handle: string,
): Promise<ArtistPageData | null> => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", profile.user_id)
    .is("hidden_at", null)
    .order("created_at", { ascending: false });

  return {
    profile,
    avatarUrl: imageUrl(supabase, profile.avatar_path),
    songs: songs ?? [],
  };
};

// The signed-in user's own profile, for the Account page.
export const getMyArtistProfile = async (): Promise<{
  userId: string;
  profile: IArtistProfile | null;
  avatarUrl: string | null;
} | null> => {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) {
    return null;
  }
  const { data: profile } = await supabase
    .from("artist_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    userId,
    profile: profile ?? null,
    avatarUrl: imageUrl(supabase, profile?.avatar_path ?? null),
  };
};

const ARTIST_RESULTS = 6;

// Artists whose name or handle contains the search text.
export const searchArtists = async (query: string) => {
  // The text goes inside a PostgREST or() filter, where commas, brackets
  // and quotes are syntax; drop them so a search can't add conditions.
  const text = query.replace(/[,()"'\\]/g, " ").trim();
  if (!text) {
    return [];
  }
  const supabase = await createClient();
  // Escape LIKE wildcards so "%" or "_" in the search match literally.
  const pattern = `%${text.replace(/[%_]/g, (c) => `\\${c}`)}%`;
  const { data } = await supabase
    .from("artist_profiles")
    .select("*")
    .or(`display_name.ilike.${pattern},handle.ilike.${pattern}`)
    .limit(ARTIST_RESULTS);
  return (data ?? []).map((profile) => ({
    profile,
    avatarUrl: imageUrl(supabase, profile.avatar_path),
  }));
};

export const isAdmin = async () => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin");
  return data === true;
};

// The admin review page: songs with open reports, most reported first,
// and the songs currently hidden. Null for anyone who isn't an admin.
export const getModerationQueue = async () => {
  const supabase = await createClient();
  if (!(await isAdmin())) {
    return null;
  }
  const [reports, hidden] = await Promise.all([
    supabase
      .from("song_reports")
      .select("song_id, reason, details, created_at, songs(*)")
      .is("resolved_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("songs")
      .select("*")
      .not("hidden_at", "is", null)
      .order("hidden_at", { ascending: false }),
  ]);
  return {
    reported: groupReports(reports.data ?? []),
    hidden: hidden.data ?? [],
  };
};

// Open reports, for the admin card on the Account page; null for anyone
// who isn't an admin (reporters can read their own reports, so a plain
// count would mislead them).
export const getOpenReportCount = async () => {
  if (!(await isAdmin())) {
    return null;
  }
  const supabase = await createClient();
  const { count } = await supabase
    .from("song_reports")
    .select("id", { count: "exact", head: true })
    .is("resolved_at", null);
  return count ?? 0;
};
