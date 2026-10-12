import { create } from "zustand";

// PlayerContent is rebuilt for every song, so anything that should outlive
// one song (volume, playback preferences) lives here instead.
interface PlayerStore {
  ids: number[];
  activeId?: number;
  volume: number;
  // Restored on unmute.
  previousVolume: number;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  volume: 1,
  previousVolume: 1,
  setId: (id: number) => set({ activeId: id }),
  setIds: (ids: number[]) => set({ ids: ids }),
  setVolume: (volume: number) => set({ volume }),
  toggleMute: () =>
    set((state) =>
      state.volume === 0
        ? { volume: state.previousVolume || 1 }
        : { volume: 0, previousVolume: state.volume },
    ),
  // Clears the queue but keeps the listener's volume.
  reset: () => set({ activeId: undefined, ids: [] }),
}));

export default usePlayer;
