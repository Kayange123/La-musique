import { create } from "zustand";
import { RepeatMode, nextRepeatMode, shuffleIds } from "@/lib/queue";
import {
  QueuedItem,
  Step,
  advance,
  goBack,
  moveQueued,
  queueSong,
  removeSongEverywhere,
} from "@/lib/playQueue";

// PlayerContent is rebuilt for every song, so anything that should outlive
// one song (volume, playback preferences, the queue) lives here instead.
interface PlayerStore {
  // Songs in the order they're listed on the page.
  ids: number[];
  // The list in the order it plays: ids, or a shuffle of them.
  queue: number[];
  // The last song played from that list; the list continues from here
  // after any queued songs.
  contextId?: number;
  activeId?: number;
  // Songs queued with Play next / Add to queue, played before the list.
  upNext: QueuedItem[];
  // Set when resuming: the player seeks here once that song loads.
  pendingSeek?: { songId: number; position: number };
  volume: number;
  // Restored on unmute.
  previousVolume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
  // Next, end of song and previous. They return the step taken so the
  // player can restart a song that didn't change, or null to stop.
  next: (reason: "manual" | "ended") => Step | null;
  previous: () => Step | null;
  // Both return the queued item's key, e.g. for an Undo button.
  playNext: (songId: number) => string;
  addToQueue: (songId: number) => string;
  removeQueued: (key: string) => void;
  moveQueued: (key: string, offset: -1 | 1) => void;
  clearQueued: () => void;
  resume: (point: { songId: number; position: number }) => void;
  // Returns and clears the pending seek if it's for this song.
  takePendingSeek: (songId: number) => number | undefined;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  // After a song is deleted: drops it everywhere and moves on if playing.
  removeSong: (id: number) => void;
  reset: () => void;
}

const usePlayer = create<PlayerStore>((set, get) => {
  const apply = (result: Step | null) => {
    if (result) {
      set({
        activeId: result.activeId,
        contextId: result.contextId,
        upNext: result.upNext,
      });
    }
    return result;
  };

  return {
    ids: [],
    queue: [],
    contextId: undefined,
    activeId: undefined,
    upNext: [],
    volume: 1,
    previousVolume: 1,
    shuffle: false,
    // Matches the original behaviour: the list wraps at the end.
    repeat: "all",
    // Starting a song from a list. Anything already queued is kept and
    // plays after this song, as in most music apps.
    setId: (id: number) => set({ activeId: id, contextId: id }),
    setIds: (ids: number[]) =>
      set((state) => ({
        ids,
        queue: state.shuffle ? shuffleIds(ids, state.contextId) : ids,
      })),
    next: (reason) => apply(advance(get(), { reason })),
    previous: () => apply(goBack(get())),
    playNext: (songId) => {
      const upNext = queueSong(get().upNext, { songId, position: "next" });
      set({ upNext });
      return upNext[0].key;
    },
    addToQueue: (songId) => {
      const upNext = queueSong(get().upNext, { songId, position: "last" });
      set({ upNext });
      return upNext[upNext.length - 1].key;
    },
    removeQueued: (key) =>
      set((state) => ({
        upNext: state.upNext.filter((item) => item.key !== key),
      })),
    moveQueued: (key, offset) =>
      set((state) => ({ upNext: moveQueued(state.upNext, { key, offset }) })),
    clearQueued: () => set({ upNext: [] }),
    resume: (point) =>
      set({
        activeId: point.songId,
        contextId: point.songId,
        ids: [point.songId],
        queue: [point.songId],
        pendingSeek: point,
      }),
    takePendingSeek: (songId) => {
      const pending = get().pendingSeek;
      if (pending?.songId !== songId) {
        return undefined;
      }
      set({ pendingSeek: undefined });
      return pending.position;
    },
    setVolume: (volume: number) => set({ volume }),
    toggleMute: () =>
      set((state) =>
        state.volume === 0
          ? { volume: state.previousVolume || 1 }
          : { volume: 0, previousVolume: state.volume },
      ),
    toggleShuffle: () =>
      set((state) => ({
        shuffle: !state.shuffle,
        queue: state.shuffle
          ? state.ids
          : shuffleIds(state.ids, state.contextId),
      })),
    cycleRepeat: () =>
      set((state) => ({ repeat: nextRepeatMode(state.repeat) })),
    removeSong: (id: number) =>
      set((state) => ({
        ...removeSongEverywhere(state, id),
        ids: state.ids.filter((x) => x !== id),
      })),
    // Clears the list and the queue but keeps the listener's preferences.
    reset: () =>
      set({
        activeId: undefined,
        contextId: undefined,
        ids: [],
        queue: [],
        upNext: [],
        pendingSeek: undefined,
      }),
  };
});

export default usePlayer;
