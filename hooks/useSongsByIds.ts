import { useEffect, useState } from "react";
import { ISong } from "@/types";
import { useSupabase } from "@/providers/Supabase";

// Loads the songs for a set of ids, e.g. everything in the queue. Results
// are cached by id, so reordering or removing doesn't refetch.
const useSongsByIds = (ids: number[]) => {
  const { supabaseClient } = useSupabase();
  const [songs, setSongs] = useState<Map<number, ISong>>(new Map());
  const missing = ids.filter((id) => !songs.has(id));
  const missingKey = Array.from(new Set(missing))
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    if (!missingKey) {
      return;
    }
    let cancelled = false;
    supabaseClient
      .from("songs")
      .select("*")
      .in("id", missingKey.split(",").map(Number))
      .then(({ data }) => {
        if (cancelled || !data) {
          return;
        }
        setSongs((previous) => {
          const next = new Map(previous);
          data.forEach((song) => next.set(song.id, song));
          return next;
        });
      });
    return () => {
      cancelled = true;
    };
  }, [missingKey, supabaseClient]);

  return songs;
};

export default useSongsByIds;
