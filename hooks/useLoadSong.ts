import { ISong } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const useLoadSong = (song: ISong) => {
  const supabase = useSupabaseClient();

  if (!song) return "";

  const { data: songData } = supabase.storage
    .from("songs")
    .getPublicUrl(song?.song_path);

  return songData.publicUrl;
};

export default useLoadSong;
