"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import PlaylistNameForm from "./PlaylistNameForm";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { useSupabase } from "@/providers/Supabase";
import { createPlaylist } from "@/lib/playlists";

const CreatePlaylistModal = () => {
  const { mode, close } = usePlaylistDialog();
  const { supabaseClient } = useSupabase();
  const router = useRouter();

  const onSubmit = async (name: string) => {
    try {
      await createPlaylist(supabaseClient, name);
      close();
      toast.success("Playlist created");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Modal
      isopen={mode === "create"}
      onChange={(open) => !open && close()}
      title="New playlist"
      description="Give your playlist a name."
    >
      {mode === "create" && (
        <PlaylistNameForm submitLabel="Create" onSubmit={onSubmit} />
      )}
    </Modal>
  );
};

export default CreatePlaylistModal;
