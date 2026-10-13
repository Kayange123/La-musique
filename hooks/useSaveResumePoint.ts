import { useEffect } from "react";
import { RESUME_KEY, toResumePoint } from "@/lib/resume";

interface Seekable {
  seek(): number;
  duration(): number;
}

const SAVE_EVERY_MS = 5000;

const save = (songId: number, sound: Seekable | null) => {
  if (!sound) {
    return;
  }
  const point = toResumePoint({
    songId,
    position: sound.seek(),
    duration: sound.duration(),
    now: Date.now(),
  });
  try {
    if (point) {
      localStorage.setItem(RESUME_KEY, JSON.stringify(point));
    }
  } catch {
    // Storage can be full or blocked (private browsing); resume is optional.
  }
};

export const clearResumePoint = () => {
  try {
    localStorage.removeItem(RESUME_KEY);
  } catch {
    // As above.
  }
};

// Saves where the listener is, every few seconds while playing and when
// they pause, so Home can offer to resume after a reload.
const useSaveResumePoint = (playback: {
  songId: number;
  sound: Seekable | null;
  isPlaying: boolean;
}) => {
  const { songId, sound, isPlaying } = playback;

  useEffect(() => {
    if (!isPlaying) {
      save(songId, sound);
      return;
    }
    const timer = setInterval(() => save(songId, sound), SAVE_EVERY_MS);
    return () => clearInterval(timer);
  }, [songId, sound, isPlaying]);
};

export default useSaveResumePoint;
