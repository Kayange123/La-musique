import { create } from "zustand";
import { IPlaylist } from "@/types";

type Mode = "create" | "edit" | "delete" | "add-song";

// Which playlist dialog is open. `playlist` is the one being edited or
// deleted; `songId` is the song being added.
interface PlaylistDialogStore {
  mode: Mode | null;
  playlist: IPlaylist | null;
  songId: number | null;
  openCreate: () => void;
  openEdit: (playlist: IPlaylist) => void;
  openDelete: (playlist: IPlaylist) => void;
  openAddSong: (songId: number) => void;
  close: () => void;
}

const usePlaylistDialog = create<PlaylistDialogStore>((set) => ({
  mode: null,
  playlist: null,
  songId: null,
  openCreate: () => set({ mode: "create", playlist: null, songId: null }),
  openEdit: (playlist) => set({ mode: "edit", playlist, songId: null }),
  openDelete: (playlist) => set({ mode: "delete", playlist, songId: null }),
  openAddSong: (songId) => set({ mode: "add-song", playlist: null, songId }),
  close: () => set({ mode: null, playlist: null, songId: null }),
}));

export default usePlaylistDialog;
