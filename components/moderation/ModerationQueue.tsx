"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ISong } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import { useSupabase } from "@/providers/Supabase";
import {
  ModerationAction,
  ReportedSong,
  moderateSong,
  reasonLabel,
} from "@/lib/moderation";
import MediaItem from "../ui/MediaItem";
import { pillOutline, sectionTitle } from "../ui/styles";

const dangerPill =
  "rounded-full bg-danger-bg px-4 py-2 text-sm font-bold text-on-accent transition hover:bg-danger disabled:opacity-50";

const DONE: Record<ModerationAction, string> = {
  hide: "Song hidden",
  dismiss: "Reports dismissed",
  restore: "Song restored",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

// Runs one moderation action, then reloads the queue.
const useModerate = () => {
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);

  const run = async (songId: number, action: ModerationAction) => {
    setBusyId(songId);
    try {
      await moderateSong(supabaseClient, { songId, action });
      toast.success(DONE[action]);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusyId(null);
    }
  };
  return { run, busyId };
};

const ReportedCard = ({
  entry,
  onPlay,
  moderate,
}: {
  entry: ReportedSong;
  onPlay: (id: number) => void;
  moderate: ReturnType<typeof useModerate>;
}) => {
  const { song, reports } = entry;
  const busy = moderate.busyId === song.id;
  return (
    <li className="flex flex-col gap-y-3 rounded-xl bg-raised p-4">
      <div className="flex items-center gap-x-3">
        <MediaItem song={song} onClick={onPlay} />
        <span className="shrink-0 font-mono text-sm text-muted">
          {reports.length} {reports.length === 1 ? "report" : "reports"}
        </span>
      </div>
      <ul className="flex flex-col gap-y-2 border-l-2 border-line pl-4">
        {reports.map((report, index) => (
          <li key={index} className="text-sm">
            <span className="font-semibold text-fg">
              {reasonLabel(report.reason)}
            </span>
            <span className="text-muted">
              {" "}
              · {formatDate(report.createdAt)}
            </span>
            {report.details && (
              <p className="mt-0.5 text-muted">{report.details}</p>
            )}
          </li>
        ))}
      </ul>
      <div className="flex gap-x-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => moderate.run(song.id, "hide")}
          className={dangerPill}
        >
          Hide song
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => moderate.run(song.id, "dismiss")}
          className={pillOutline}
        >
          Dismiss
        </button>
      </div>
    </li>
  );
};

const ModerationQueue = ({
  reported,
  hidden,
}: {
  reported: ReportedSong[];
  hidden: ISong[];
}) => {
  const moderate = useModerate();
  // Admins can play hidden and reported songs to check them.
  const onPlay = useOnPlay([...reported.map((entry) => entry.song), ...hidden]);

  return (
    <div className="flex flex-col gap-y-10 px-6 pb-10">
      <section aria-labelledby="reported-heading" className="max-w-3xl">
        <h2 id="reported-heading" className={`${sectionTitle} mb-4`}>
          Reported ({reported.length})
        </h2>
        {reported.length === 0 ? (
          <p className="text-muted">Nothing to review.</p>
        ) : (
          <ul className="flex flex-col gap-y-3">
            {reported.map((entry) => (
              <ReportedCard
                key={entry.song.id}
                entry={entry}
                onPlay={onPlay}
                moderate={moderate}
              />
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="hidden-heading" className="max-w-3xl">
        <h2 id="hidden-heading" className={`${sectionTitle} mb-4`}>
          Hidden ({hidden.length})
        </h2>
        {hidden.length === 0 ? (
          <p className="text-muted">No hidden songs.</p>
        ) : (
          <ul className="flex flex-col gap-y-1">
            {hidden.map((song) => (
              <li key={song.id} className="flex items-center gap-x-3">
                <MediaItem song={song} onClick={onPlay} />
                <button
                  type="button"
                  disabled={moderate.busyId === song.id}
                  onClick={() => moderate.run(song.id, "restore")}
                  className={pillOutline}
                >
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ModerationQueue;
