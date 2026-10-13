import {
  RepeatMode,
  getAutoNextId,
  getNextId,
  getPreviousId,
  removeFromQueue,
} from "./queue";

// A song the listener queued with "Play next" or "Add to queue". The key
// tells apart two queued copies of the same song.
export interface QueuedItem {
  key: string;
  songId: number;
}

export interface PlaybackState {
  // The list being played (page order, or shuffled).
  queue: number[];
  // The last song played from that list. It differs from activeId while a
  // queued song plays, and is where the list continues afterwards.
  contextId?: number;
  activeId?: number;
  // Queued songs, played before the list continues.
  upNext: QueuedItem[];
  repeat: RepeatMode;
}

// What to play next. `restart` means the same song plays again, which the
// player has to handle itself because nothing changes in the store.
export interface Step {
  activeId: number;
  contextId?: number;
  upNext: QueuedItem[];
  restart: boolean;
}

const step = (
  state: PlaybackState,
  change: { activeId: number; contextId?: number; upNext?: QueuedItem[] },
): Step => ({
  activeId: change.activeId,
  contextId: "contextId" in change ? change.contextId : state.contextId,
  upNext: change.upNext ?? state.upNext,
  restart: change.activeId === state.activeId,
});

// Repeat one replays the song only when it ends; next still skips.
const replaysCurrent = (
  state: PlaybackState,
  options: { reason: "manual" | "ended" },
) => options.reason === "ended" && state.repeat === "one";

// Moves on after the song ends ("ended") or the listener presses next
// ("manual"). Queued songs play first; then the list continues from where
// it left off. Returns null when playback should stop (end of the list
// with repeat off).
export const advance = (
  state: PlaybackState,
  options: { reason: "manual" | "ended" },
): Step | null => {
  if (replaysCurrent(state, options) && state.activeId !== undefined) {
    return step(state, { activeId: state.activeId });
  }

  const [queued, ...rest] = state.upNext;
  if (queued) {
    return step(state, { activeId: queued.songId, upNext: rest });
  }

  // Pressing next always wraps; the end of a song respects repeat off.
  const nextId =
    options.reason === "manual"
      ? getNextId(state.queue, state.contextId)
      : getAutoNextId(state.queue, state.contextId, state.repeat);
  if (nextId === undefined) {
    return null;
  }
  return step(state, { activeId: nextId, contextId: nextId });
};

// From a queued song, previous returns to the list song before it.
// Otherwise it steps back through the list, wrapping round.
export const goBack = (state: PlaybackState): Step | null => {
  const playingQueued =
    state.contextId !== undefined && state.activeId !== state.contextId;
  const previousId = playingQueued
    ? state.contextId
    : getPreviousId(state.queue, state.contextId);
  if (previousId === undefined) {
    return null;
  }
  return step(state, { activeId: previousId, contextId: previousId });
};

let keyCounter = 0;
const newKey = () => `queued-${Date.now()}-${++keyCounter}`;

export const queueSong = (
  upNext: QueuedItem[],
  options: { songId: number; position: "next" | "last" },
): QueuedItem[] => {
  const item = { key: newKey(), songId: options.songId };
  return options.position === "next" ? [item, ...upNext] : [...upNext, item];
};

const isIndexIn = (list: unknown[], index: number) =>
  index >= 0 && index < list.length;

// Moves one queued item up (-1) or down (+1); out-of-range moves do
// nothing.
export const moveQueued = (
  upNext: QueuedItem[],
  options: { key: string; offset: -1 | 1 },
): QueuedItem[] => {
  const from = upNext.findIndex((item) => item.key === options.key);
  const to = from + options.offset;
  if (from === -1 || !isIndexIn(upNext, to)) {
    return upNext;
  }
  const result = [...upNext];
  [result[from], result[to]] = [result[to], result[from]];
  return result;
};

// After a song is deleted: drop it from the list and the queue. If it was
// playing, move on as if next had been pressed.
export const removeSongEverywhere = (
  state: PlaybackState,
  songId: number,
): Pick<PlaybackState, "queue" | "contextId" | "activeId" | "upNext"> => {
  const upNext = state.upNext.filter((item) => item.songId !== songId);
  const context = removeFromQueue(state.queue, state.contextId, songId);
  const remaining = {
    ...state,
    upNext,
    queue: context.queue,
    contextId: context.activeId,
  };

  if (state.activeId !== songId) {
    // If the deleted song was the list cursor (a queued song is playing),
    // step the cursor back one so the list resumes with the song after it.
    const cursorDeleted = state.contextId === songId;
    const index = state.queue.indexOf(songId);
    return {
      ...remaining,
      activeId: state.activeId,
      contextId: cursorDeleted
        ? (state.queue[index - 1] ?? undefined)
        : remaining.contextId,
    };
  }
  if (state.contextId === songId) {
    // It was the list song: removeFromQueue already chose the next one.
    return { ...remaining, activeId: context.activeId };
  }
  // It was a queued song: continue as if next were pressed.
  const next = advance(remaining, { reason: "manual" });
  return {
    ...remaining,
    activeId: next?.activeId,
    contextId: next?.contextId,
    upNext: next?.upNext ?? upNext,
  };
};

// The list songs that will play after the queue, for the Up next panel:
// from the song after the cursor, wrapping round with repeat all, stopping
// at the end with repeat off. Repeat one is shown like repeat all, since
// next still moves through the list.
export const upcomingFromList = (
  state: Pick<PlaybackState, "queue" | "contextId" | "repeat">,
  options: { limit: number },
): number[] => {
  const start = state.queue.indexOf(state.contextId as number) + 1;
  const after = state.queue.slice(start);
  const wrapped =
    state.repeat === "off" ? [] : state.queue.slice(0, Math.max(start - 1, 0));
  return [...after, ...wrapped].slice(0, options.limit);
};
