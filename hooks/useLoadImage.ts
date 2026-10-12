import { ISong } from "@/types";
import { useSupabase } from "@/providers/Supabase";

const useLoadImage = (song: ISong) => {
  const { supabaseClient: supabase } = useSupabase();

  if (!song?.image_path) return null;

  const { data: imageData } = supabase.storage
    .from("images")
    .getPublicUrl(song.image_path);

  return imageData.publicUrl;
};

export default useLoadImage;
