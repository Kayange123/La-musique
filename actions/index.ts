import { ISong } from "@/types";
import { createClient, getUserId } from "@/lib/supabase/server";

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
