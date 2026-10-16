"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import toast from "react-hot-toast";
import { BsThreeDots } from "react-icons/bs";
import { MdQueueMusic, MdPlaylistAdd } from "react-icons/md";
import { RiPlayListAddLine } from "react-icons/ri";
import { ISong } from "@/types";
import usePlayer from "@/hooks/usePlayer";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import useAuthModal from "@/hooks/useAuthModal";
import useSongActions from "@/hooks/useSongActions";
import { FiEdit2, FiFlag, FiTrash2, FiUser } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/providers/Supabase";
import { lookupHandle } from "@/lib/artistDirectory";
import { useUser } from "@/hooks/useUser";

interface SongMenuProps {
  song: ISong;
}

// Confirms a queue action with an Undo that removes exactly that entry.
const confirmQueued = (message: string, key: string) =>
  toast((t) => (
    <span className="flex items-center gap-x-3">
      {message}
      <button
        type="button"
        className="font-semibold underline"
        onClick={() => {
          usePlayer.getState().removeQueued(key);
          toast.dismiss(t.id);
        }}
      >
        Undo
      </button>
    </span>
  ));

const itemClass =
  "flex items-center gap-x-3 rounded-md px-3 py-2.5 text-sm outline-none cursor-pointer data-[highlighted]:bg-overlay";

const SongMenu = ({ song }: SongMenuProps) => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const openAddSong = usePlaylistDialog((state) => state.openAddSong);
  const songActions = useSongActions();
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  // The artist's handle, looked up when the menu first opens; null if the
  // uploader hasn't made a profile.
  const [artistHandle, setArtistHandle] = useState<string | null>(null);

  const onOpenChange = (open: boolean) => {
    if (open && song.user_id) {
      lookupHandle(supabaseClient, song.user_id)
        .then(setArtistHandle)
        .catch(() => setArtistHandle(null));
    }
  };
  // Only the uploader can edit or delete; RLS enforces it regardless.
  const isOwner = !!user && user.id === song.user_id;

  // Queueing needs the player, which needs an account.
  const whenSignedIn = (action: () => void) => () =>
    user ? action() : authModal.onOpen();

  const playNext = whenSignedIn(() => {
    const key = usePlayer.getState().playNext(song.id);
    confirmQueued(`"${song.title}" will play next`, key);
  });

  const addToQueue = whenSignedIn(() => {
    const key = usePlayer.getState().addToQueue(song.id);
    confirmQueued(`Added "${song.title}" to the queue`, key);
  });

  return (
    <DropdownMenu.Root onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`More options for ${song.title}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition hover:text-fg data-[state=open]:text-fg"
        >
          <BsThreeDots size={18} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[220px] rounded-xl border border-line bg-raised p-1 text-fg shadow-2xl"
        >
          <DropdownMenu.Item className={itemClass} onSelect={playNext}>
            <MdQueueMusic size={18} aria-hidden="true" />
            Play next
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClass} onSelect={addToQueue}>
            <MdPlaylistAdd size={18} aria-hidden="true" />
            Add to queue
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-line" />
          <DropdownMenu.Item
            className={itemClass}
            onSelect={whenSignedIn(() => openAddSong(song.id))}
          >
            <RiPlayListAddLine size={18} aria-hidden="true" />
            Add to playlist
          </DropdownMenu.Item>
          {artistHandle && (
            <DropdownMenu.Item
              className={itemClass}
              onSelect={() => router.push(`/artist/${artistHandle}`)}
            >
              <FiUser size={16} aria-hidden="true" />
              Go to artist
            </DropdownMenu.Item>
          )}
          {!isOwner && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                className={itemClass}
                onSelect={whenSignedIn(() => songActions.openReport(song))}
              >
                <FiFlag size={16} aria-hidden="true" />
                Report song
              </DropdownMenu.Item>
            </>
          )}
          {isOwner && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-line" />
              <DropdownMenu.Item
                className={itemClass}
                onSelect={() => songActions.openEdit(song)}
              >
                <FiEdit2 size={16} aria-hidden="true" />
                Edit details
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={`${itemClass} text-danger`}
                onSelect={() => songActions.openDelete(song)}
              >
                <FiTrash2 size={16} aria-hidden="true" />
                Delete song
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SongMenu;
