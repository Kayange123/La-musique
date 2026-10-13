"use client";
import { toast } from "react-hot-toast";
import { ISong } from "@/types";
import { useSupabase } from "@/providers/Supabase";
import { useEffect, useMemo, useState } from "react";

const useGetSongById = (id?: number) => {
  const [song, setSong] = useState<ISong | undefined>(undefined);
  const [failedId, setFailedId] = useState<number | undefined>(undefined);
  const { supabaseClient } = useSupabase();

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;

    const fetchSong = async () => {
      const { data, error } = await supabaseClient
        .from("songs")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled) {
        return;
      }
      if (error) {
        setFailedId(id);
        return toast.error(error.message);
      }
      setSong(data);
    };
    fetchSong();

    return () => {
      cancelled = true;
    };
  }, [id, supabaseClient]);

  const isLoading = !!id && song?.id !== id && failedId !== id;

  return useMemo(
    () => ({
      isLoading,
      song,
    }),
    [isLoading, song],
  );
};

export default useGetSongById;
