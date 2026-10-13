"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { useSupabase } from "@/providers/Supabase";
import { IPlaylist } from "@/types";
import { MAX_PLAYLIST_NAME } from "@/lib/playlists";
import {
  MAX_DESCRIPTION,
  removePlaylistCover,
  setPlaylistCover,
  updatePlaylistDetails,
} from "@/lib/playlistDetails";
import { IMAGE_TYPES } from "@/lib/upload";

type CoverChoice = "keep" | "mosaic" | "upload";

const EditPlaylistForm = ({ playlist }: { playlist: IPlaylist }) => {
  const { close } = usePlaylistDialog();
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description ?? "");
  const [cover, setCover] = useState<CoverChoice>(
    playlist.cover_path ? "keep" : "mosaic",
  );
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveCover = async () => {
    if (cover === "upload" && file) {
      await setPlaylistCover(supabaseClient, { playlist, file });
    }
    if (cover === "mosaic" && playlist.cover_path) {
      await removePlaylistCover(supabaseClient, playlist);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (cover === "upload" && !file) {
      return toast.error("Choose an image for the cover");
    }
    setIsSaving(true);
    try {
      await updatePlaylistDetails(supabaseClient, {
        id: playlist.id,
        name,
        description,
      });
      await saveCover();
      close();
      toast.success("Playlist updated");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const coverOptions: { value: CoverChoice; label: string }[] = [
    ...(playlist.cover_path
      ? [{ value: "keep" as const, label: "Keep the current cover" }]
      : []),
    { value: "mosaic", label: "Use the first songs' covers" },
    { value: "upload", label: "Upload an image" },
  ];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
      <label className="flex flex-col gap-y-1.5 text-sm font-semibold text-fg">
        Name
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_PLAYLIST_NAME}
          disabled={isSaving}
          required
        />
      </label>
      <label className="flex flex-col gap-y-1.5 text-sm font-semibold text-fg">
        <span className="flex justify-between">
          Description
          <span className="font-normal text-muted">Optional</span>
        </span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={MAX_DESCRIPTION}
          rows={3}
          disabled={isSaving}
          placeholder="What's this playlist for?"
          className="rounded-lg border border-line bg-overlay p-3 text-[15px] font-normal text-fg placeholder:text-muted transition focus:border-accent"
        />
        <span className="self-end text-xs font-normal text-muted tabular-nums">
          {description.length} / {MAX_DESCRIPTION}
        </span>
      </label>
      <fieldset className="flex flex-col gap-y-2" disabled={isSaving}>
        <legend className="mb-1 text-sm font-semibold text-fg">Cover</legend>
        {coverOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-x-2 text-sm"
          >
            <input
              type="radio"
              name="cover"
              value={option.value}
              checked={cover === option.value}
              onChange={() => setCover(option.value)}
              className="h-4 w-4"
            />
            {option.label}
          </label>
        ))}
        {cover === "upload" && (
          <input
            type="file"
            accept={IMAGE_TYPES.join(",")}
            aria-label="Cover image"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-raised file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-fg"
          />
        )}
      </fieldset>
      <p className="text-sm text-muted">Only you can see this playlist.</p>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </form>
  );
};

const EditPlaylistModal = () => {
  const { mode, playlist, close } = usePlaylistDialog();

  return (
    <Modal
      isopen={mode === "edit"}
      onChange={(open) => !open && close()}
      title="Edit details"
      description="Name, description and cover."
    >
      {mode === "edit" && playlist && (
        <EditPlaylistForm key={playlist.id} playlist={playlist} />
      )}
    </Modal>
  );
};

export default EditPlaylistModal;
