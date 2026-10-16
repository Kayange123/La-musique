"use client";
import { toast } from "react-hot-toast";
import { ISong } from "@/types";
import { useSupabase } from "@/providers/Supabase";
import { useEffect, useMemo, useState } from "react";
import usePlayer from "./usePlayer";

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
        // No row: deleted, or hidden by moderators since it was queued.
        .maybeSingle();

      if (cancelled) {
        return;
      }
      if (error) {
        setFailedId(id);
        return toast.error(error.message);
      }
      if (!data) {
        setFailedId(id);
        toast.error("That song isn't available any more");
        // Drop it from the queue and move on, as for a deleted song.
        return usePlayer.getState().removeSong(id);
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
