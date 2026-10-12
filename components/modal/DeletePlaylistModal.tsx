"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Button from "../ui/Button";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { useSupabase } from "@/providers/Supabase";
import { deletePlaylist } from "@/lib/playlists";

const DeletePlaylistModal = () => {
  const { mode, playlist, close } = usePlaylistDialog();
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    if (!playlist) {
      return;
    }
    setIsDeleting(true);
    try {
      await deletePlaylist(supabaseClient, playlist.id);
    } catch (error) {
      setIsDeleting(false);
      return toast.error((error as Error).message);
    }
    setIsDeleting(false);
    close();
    toast.success("Playlist deleted");
    // The page being viewed no longer exists.
    router.replace("/library");
    router.refresh();
  };

  return (
    <Modal
      isopen={mode === "delete"}
      onChange={(open) => !open && close()}
      title="Delete playlist"
      description={
        playlist
          ? `Delete "${playlist.name}"? The songs in it aren't deleted.`
          : ""
      }
    >
      <div className="flex gap-x-3">
        <Button
          onClick={close}
          disabled={isDeleting}
          className="bg-neutral-700 text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          className="bg-red-500 text-white"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
};

export default DeletePlaylistModal;
