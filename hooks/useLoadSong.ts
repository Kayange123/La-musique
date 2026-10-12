import { ISong } from "@/types";
import { useSupabase } from "@/providers/Supabase";

const useLoadSong = (song: ISong) => {
  const { supabaseClient: supabase } = useSupabase();

  if (!song?.song_path) return "";

  const { data: songData } = supabase.storage
    .from("songs")
    .getPublicUrl(song.song_path);

  return songData.publicUrl;
};

export default useLoadSong;
