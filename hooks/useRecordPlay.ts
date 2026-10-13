import { useEffect, useRef } from "react";
import { useSupabase } from "@/providers/Supabase";
import { isCountedPlay, recordPlay } from "@/lib/history";

// Records the song in the listener's history once the play counts (10s of
// listening, or reaching the end). Each mount of the player is one play,
// so this records at most once.
const useRecordPlay = (play: { songId: number; isPlaying: boolean }) => {
  const { supabaseClient, user } = useSupabase();
  const listened = useRef(0);
  const recorded = useRef(false);

  const record = (ended: boolean) => {
    if (recorded.current || !user) {
      return;
    }
    if (!isCountedPlay({ listenedSeconds: listened.current, ended })) {
      return;
    }
    recorded.current = true;
    recordPlay(supabaseClient, { songId: play.songId }).catch((error) =>
      // History is a convenience; a failed write shouldn't interrupt music.
      console.error("Couldn't record play", error),
    );
  };

  useEffect(() => {
    if (!play.isPlaying) {
      return;
    }
    const timer = setInterval(() => {
      listened.current += 1;
      record(false);
    }, 1000);
    return () => clearInterval(timer);
    // record reads refs and the current user; re-subscribing on every
    // render would restart the one-second count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play.isPlaying]);

  return { onEnded: () => record(true) };
};

export default useRecordPlay;
