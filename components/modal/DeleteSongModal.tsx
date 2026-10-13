"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Button from "../ui/Button";
import useSongActions from "@/hooks/useSongActions";
import usePlayer from "@/hooks/usePlayer";
import { useSupabase } from "@/providers/Supabase";
import { deleteOwnSong } from "@/lib/songs";

const DeleteSongModal = () => {
  const { song, mode, close } = useSongActions();
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    if (!song) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteOwnSong(supabaseClient, song.id);
    } catch (error) {
      setIsDeleting(false);
      return toast.error((error as Error).message);
    }
    usePlayer.getState().removeSong(song.id);
    setIsDeleting(false);
    close();
    toast.success("Song deleted");
    router.refresh();
  };

  return (
    <Modal
      isopen={mode === "delete"}
      onChange={(open) => !open && close()}
      title="Delete song"
      description={
        song
          ? `Delete "${song.title}"? This removes it for everyone and can't be undone.`
          : ""
      }
    >
      <div className="flex gap-x-3">
        <Button
          onClick={close}
          disabled={isDeleting}
          className="bg-raised text-fg hover:bg-overlay"
        >
          Cancel
        </Button>
        <Button
          onClick={onDelete}
          disabled={isDeleting}
          className="bg-danger-bg text-on-accent hover:bg-danger"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteSongModal;
