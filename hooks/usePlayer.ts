import { create } from "zustand";

interface PlayerStore {
  ids: number[];
  activeId?: number;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
  reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id: number) => set({ activeId: id }),
  setIds: (ids: number[]) => set({ ids: ids }),
  reset: () => set({ activeId: undefined, ids: [] }),
}));

export default usePlayer;
