import { ISong } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const useLoadImage = (song: ISong) => {
  const supabase = useSupabaseClient();

  if (!song) return null;

  const { data: imageData } = supabase.storage
    .from("images")
    .getPublicUrl(song?.image_path);

  return imageData.publicUrl;
};

export default useLoadImage;
