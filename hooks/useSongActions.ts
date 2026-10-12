import { create } from "zustand";
import { ISong } from "@/types";

// Which of the owner's song dialogs is open, and for which song.
interface SongActionsStore {
  song: ISong | null;
  mode: "edit" | "delete" | null;
  openEdit: (song: ISong) => void;
  openDelete: (song: ISong) => void;
  close: () => void;
}

const useSongActions = create<SongActionsStore>((set) => ({
  song: null,
  mode: null,
  openEdit: (song) => set({ song, mode: "edit" }),
  openDelete: (song) => set({ song, mode: "delete" }),
  close: () => set({ song: null, mode: null }),
}));

export default useSongActions;
