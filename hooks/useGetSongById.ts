"use client";
import { toast } from "react-hot-toast";
import { ISong } from "@/types";
import { useSupabase } from "@/providers/Supabase";
import { useEffect, useMemo, useState } from "react";

const useGetSongById = (id?: number) => {
  const [isLoading, setIsLoading] = useState(false);
  const [song, setSong] = useState<ISong | undefined>(undefined);
  const { supabaseClient } = useSupabase();

  useEffect(() => {
    if (!id) {
      return;
    }
    setIsLoading(true);
    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();

      setIsLoading(false);
      if (error) {
        return toast.error(error.message);
      }
      setSong(data);
    };
    fetchSong();
  }, [id, supabaseClient]);

  return useMemo(
    () => ({
      isLoading,
      song,
    }),
    [isLoading, song]
  );
};

export default useGetSongById;
