"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import PlaylistNameForm from "./PlaylistNameForm";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { useSupabase } from "@/providers/Supabase";
import { renamePlaylist } from "@/lib/playlists";

const RenamePlaylistModal = () => {
  const { mode, playlist, close } = usePlaylistDialog();
  const { supabaseClient } = useSupabase();
  const router = useRouter();

  const onSubmit = async (name: string) => {
    if (!playlist) {
      return;
    }
    try {
      await renamePlaylist(supabaseClient, playlist.id, name);
      close();
      toast.success("Playlist renamed");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Modal
      isopen={mode === "rename"}
      onChange={(open) => !open && close()}
      title="Rename playlist"
      description="Choose a new name."
    >
      {mode === "rename" && playlist && (
        <PlaylistNameForm
          key={playlist.id}
          initialName={playlist.name}
          submitLabel="Save"
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
};

export default RenamePlaylistModal;
