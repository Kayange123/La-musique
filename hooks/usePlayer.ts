import { create } from "zustand";
import { RepeatMode, nextRepeatMode, shuffleIds } from "@/lib/queue";

// PlayerContent is rebuilt for every song, so anything that should outlive
// one song (volume, playback preferences) lives here instead.
interface PlayerStore {
  // Songs in the order they're listed on the page.
  ids: number[];
  // Songs in the order they play: ids, or a shuffle of them.
  queue: number[];
  activeId?: number;
  volume: number;
  // Restored on unmute.
  previousVolume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  queue: [],
  activeId: undefined,
  volume: 1,
  previousVolume: 1,
  shuffle: false,
  // Matches the original behaviour: the queue wraps at the end.
  repeat: "all",
  setId: (id: number) => set({ activeId: id }),
  setIds: (ids: number[]) =>
    set((state) => ({
      ids,
      queue: state.shuffle ? shuffleIds(ids, state.activeId) : ids,
    })),
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
      queue: state.shuffle ? state.ids : shuffleIds(state.ids, state.activeId),
    })),
  cycleRepeat: () => set((state) => ({ repeat: nextRepeatMode(state.repeat) })),
  // Clears the queue but keeps the listener's preferences.
  reset: () => set({ activeId: undefined, ids: [], queue: [] }),
}));

export default usePlayer;
