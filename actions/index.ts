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
