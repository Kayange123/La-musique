"use client";

import { useEffect, useState } from "react";
import { BsPlayFill } from "react-icons/bs";
import { RESUME_KEY, ResumePoint, parseResumePoint } from "@/lib/resume";
import { formatTime } from "@/lib/time";
import { clearResumePoint } from "@/hooks/useSaveResumePoint";
import usePlayer from "@/hooks/usePlayer";
import useSongsByIds from "@/hooks/useSongsByIds";
import { useUser } from "@/hooks/useUser";
import MediaItem from "../ui/MediaItem";

const readSavedPoint = () => {
  try {
    return parseResumePoint(localStorage.getItem(RESUME_KEY), {
      now: Date.now(),
    });
  } catch {
    // Storage blocked: nothing to offer.
    return null;
  }
};

// "Pick up where you left off": offered on Home when a song was stopped
// part-way through and nothing is playing now.
const ResumeCard = () => {
  const { user } = useUser();
  const isPlaying = usePlayer((state) => state.activeId !== undefined);
  const [point, setPoint] = useState<ResumePoint | null>(null);

  // localStorage only exists in the browser, so read it after hydration.
  useEffect(() => {
    const saved = readSavedPoint();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser storage after hydration
      setPoint(saved);
    }
  }, []);

  const songs = useSongsByIds(point ? [point.songId] : []);
  const song = point ? songs.get(point.songId) : undefined;

  // Only offered to a signed-in listener with nothing playing.
  if (!user || isPlaying) {
    return null;
  }
  // A deleted song never loads, so the card never shows for it.
  if (!point || !song) {
    return null;
  }

  const resume = () => usePlayer.getState().resume(point);
  const dismiss = () => {
    clearResumePoint();
    setPoint(null);
  };

  return (
    <section
      aria-labelledby="resume-heading"
      className="rounded-lg bg-neutral-800 p-4 flex flex-col gap-y-3 max-w-xl"
    >
      <h2
        id="resume-heading"
        className="text-xs font-semibold uppercase tracking-wider text-neutral-400"
      >
        Pick up where you left off
      </h2>
      <div className="flex items-center gap-x-3">
        <div className="flex-1 min-w-0">
          <MediaItem song={song} onClick={resume} />
        </div>
        <span className="text-sm text-neutral-400 tabular-nums">
          {formatTime(point.position)}
        </span>
        <button
          type="button"
          onClick={resume}
          aria-label={`Resume ${song.title} from ${formatTime(point.position)}`}
          className="rounded-full bg-green-500 p-3 text-black hover:scale-105 transition"
        >
          <BsPlayFill size={22} aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="self-start text-sm font-semibold text-neutral-400 hover:text-white"
      >
        Not now
      </button>
    </section>
  );
};

export default ResumeCard;
