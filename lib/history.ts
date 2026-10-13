import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

type Client = SupabaseClient<Database>;

// A play counts after this much listening, or when a shorter song ends,
// so skipping through songs doesn't fill the history.
export const COUNTED_PLAY_SECONDS = 10;

export const isCountedPlay = (listen: {
  listenedSeconds: number;
  ended: boolean;
}) => listen.ended || listen.listenedSeconds >= COUNTED_PLAY_SECONDS;

export const recordPlay = async (
  supabase: Client,
  play: { songId: number },
) => {
  const { error } = await supabase
    .from("play_history")
    .insert({ song_id: play.songId });
  if (error) {
    throw new Error(error.message);
  }
};

// History rows newest first -> each song once, at its latest play.
export const latestDistinct = <T extends { song_id: number }>(
  rows: T[],
  options: { limit: number },
): T[] => {
  const seen = new Set<number>();
  const result: T[] = [];
  for (const row of rows) {
    if (!seen.has(row.song_id)) {
      seen.add(row.song_id);
      result.push(row);
    }
    if (result.length === options.limit) {
      break;
    }
  }
  return result;
};
