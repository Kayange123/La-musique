"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import useSongActions from "@/hooks/useSongActions";
import { useSupabase } from "@/providers/Supabase";
import { ISong } from "@/types";

const EditSongForm = ({ song }: { song: ISong }) => {
  const { close } = useSongActions();
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  const [title, setTitle] = useState(song.title ?? "");
  const [author, setAuthor] = useState(song.author ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !author.trim()) {
      return toast.error("Title and author are required");
    }
    setIsSaving(true);
    // RLS limits updates to the owner; an empty result means it wasn't theirs.
    const { data, error } = await supabaseClient
      .from("songs")
      .update({ title: title.trim(), author: author.trim() })
      .eq("id", song.id)
      .select("id");
    setIsSaving(false);

    if (error || !data?.length) {
      return toast.error(error?.message ?? "Couldn't update this song");
    }
    close();
    toast.success("Song updated");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-3">
      <label className="flex flex-col gap-y-1 text-sm">
        Title
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSaving}
          required
        />
      </label>
      <label className="flex flex-col gap-y-1 text-sm">
        Author
        <Input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          disabled={isSaving}
          required
        />
      </label>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
};

const EditSongModal = () => {
  const { song, mode, close } = useSongActions();

  return (
    <Modal
      isopen={mode === "edit"}
      onChange={(open) => !open && close()}
      title="Edit song"
      description="Change the title or author."
    >
      {/* Keyed so the form starts from the selected song's values. */}
      {song && <EditSongForm key={song.id} song={song} />}
    </Modal>
  );
};

export default EditSongModal;
