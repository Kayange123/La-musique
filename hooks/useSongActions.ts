import { create } from "zustand";
import { ISong } from "@/types";

// Which song dialog is open (the owner's edit and delete, or a
// listener's report), and for which song.
interface SongActionsStore {
  song: ISong | null;
  mode: "edit" | "delete" | "report" | null;
  openEdit: (song: ISong) => void;
  openDelete: (song: ISong) => void;
  openReport: (song: ISong) => void;
  close: () => void;
}

const useSongActions = create<SongActionsStore>((set) => ({
  song: null,
  mode: null,
  openEdit: (song) => set({ song, mode: "edit" }),
  openDelete: (song) => set({ song, mode: "delete" }),
  openReport: (song) => set({ song, mode: "report" }),
  close: () => set({ song: null, mode: null }),
}));

export default useSongActions;
