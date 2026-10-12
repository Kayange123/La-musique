"use client";

import { FiArrowDown, FiArrowUp, FiX } from "react-icons/fi";
import { ISong } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import useSongsByIds from "@/hooks/useSongsByIds";
import { upcomingFromList } from "@/lib/playQueue";
import MediaItem from "../ui/MediaItem";

// How many upcoming list songs to show after the queue.
const LIST_PREVIEW = 10;

const headingClass =
  "text-xs font-semibold uppercase tracking-wider text-neutral-400";
const iconButtonClass =
  "p-2 rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400";

const SongRow = ({ song, onPlay }: { song?: ISong; onPlay?: () => void }) =>
  song ? (
    <MediaItem song={song} onClick={() => onPlay?.()} />
  ) : (
    <div className="h-[66px] rounded-md bg-neutral-800/50" aria-hidden="true" />
  );

const QueueList = () => {
  const { activeId, upNext, queue, contextId, repeat } = usePlayer();
  const upcoming = upcomingFromList(
    { queue, contextId, repeat },
    {
      limit: LIST_PREVIEW,
    },
  );
  const songs = useSongsByIds([
    ...(activeId !== undefined ? [activeId] : []),
    ...upNext.map((item) => item.songId),
    ...upcoming,
  ]);
  const { removeQueued, moveQueued, clearQueued, setId } = usePlayer.getState();

  if (activeId === undefined) {
    return <p className="text-neutral-400">Nothing is playing.</p>;
  }

  return (
    <div className="flex flex-col gap-y-5">
      <section aria-labelledby="queue-now" className="flex flex-col gap-y-2">
        <h3 id="queue-now" className={headingClass}>
          Now playing
        </h3>
        <SongRow song={songs.get(activeId)} />
      </section>

      {upNext.length > 0 && (
        <section aria-labelledby="queue-next" className="flex flex-col gap-y-2">
          <div className="flex items-center justify-between">
            <h3 id="queue-next" className={headingClass}>
              Next in queue · {upNext.length}
            </h3>
            <button
              type="button"
              onClick={clearQueued}
              className="text-sm font-semibold text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          </div>
          <ol className="flex flex-col gap-y-1">
            {upNext.map((item, index) => {
              const song = songs.get(item.songId);
              const title = song?.title ?? "song";
              return (
                <li key={item.key} className="flex items-center gap-x-1">
                  <div className="flex-1 min-w-0">
                    <SongRow song={song} />
                  </div>
                  <button
                    type="button"
                    onClick={() => moveQueued(item.key, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${title} up`}
                    className={iconButtonClass}
                  >
                    <FiArrowUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQueued(item.key, 1)}
                    disabled={index === upNext.length - 1}
                    aria-label={`Move ${title} down`}
                    className={iconButtonClass}
                  >
                    <FiArrowDown size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQueued(item.key)}
                    aria-label={`Remove ${title} from queue`}
                    className={iconButtonClass}
                  >
                    <FiX size={16} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="queue-list" className="flex flex-col gap-y-2">
          <h3 id="queue-list" className={headingClass}>
            Then from the list
          </h3>
          <ol className="flex flex-col gap-y-1">
            {upcoming.map((id) => (
              <li key={id}>
                {/* Jumps to that song; queued songs still play after it. */}
                <SongRow song={songs.get(id)} onPlay={() => setId(id)} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
};

export default QueueList;
