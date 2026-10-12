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
  "flex items-center gap-x-3 rounded-md px-3 py-2.5 text-sm outline-none cursor-pointer data-[highlighted]:bg-neutral-700";

const SongMenu = ({ song }: SongMenuProps) => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const openAddSong = usePlaylistDialog((state) => state.openAddSong);

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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={`More options for ${song.title}`}
          className="p-2 rounded-full text-neutral-400 hover:text-white data-[state=open]:text-white"
        >
          <BsThreeDots size={18} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[220px] rounded-lg border border-neutral-700 bg-neutral-800 p-1 text-white shadow-xl"
        >
          <DropdownMenu.Item className={itemClass} onSelect={playNext}>
            <MdQueueMusic size={18} aria-hidden="true" />
            Play next
          </DropdownMenu.Item>
          <DropdownMenu.Item className={itemClass} onSelect={addToQueue}>
            <MdPlaylistAdd size={18} aria-hidden="true" />
            Add to queue
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-neutral-700" />
          <DropdownMenu.Item
            className={itemClass}
            onSelect={whenSignedIn(() => openAddSong(song.id))}
          >
            <RiPlayListAddLine size={18} aria-hidden="true" />
            Add to playlist
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default SongMenu;
