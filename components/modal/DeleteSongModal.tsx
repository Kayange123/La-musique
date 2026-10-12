"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Button from "../ui/Button";
import useSongActions from "@/hooks/useSongActions";
import usePlayer from "@/hooks/usePlayer";
import { useSupabase } from "@/providers/Supabase";

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
    // Delete the row first: RLS only matches the owner's songs, so an
    // empty result means it wasn't theirs and no files are touched. Likes
    // go with it through the foreign key's on delete cascade.
    const { data, error } = await supabaseClient
      .from("songs")
      .delete()
      .eq("id", song.id)
      .select("song_path, image_path");

    if (error || !data?.length) {
      setIsDeleting(false);
      return toast.error(error?.message ?? "Couldn't delete this song");
    }

    const paths = data[0];
    const removals = await Promise.all([
      paths.song_path &&
        supabaseClient.storage.from("songs").remove([paths.song_path]),
      paths.image_path &&
        supabaseClient.storage.from("images").remove([paths.image_path]),
    ]);
    if (removals.some((result) => result && result.error)) {
      // The song is gone from the app; only storage cleanup failed.
      console.error("Song deleted but files remain", removals);
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

export default DeleteSongModal;
