"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlinePlus } from "react-icons/ai";
import { RiPlayListFill } from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { IPlaylist } from "@/types";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";

interface PlaylistListProps {
  playlists: IPlaylist[];
}

const PlaylistList = ({ playlists }: PlaylistListProps) => {
  const pathname = usePathname();
  const { user } = useUser();
  const authModal = useAuthModal();
  const { openCreate } = usePlaylistDialog();

  const onCreate = () => (user ? openCreate() : authModal.onOpen());

  return (
    <section aria-labelledby="playlists-heading" className="px-2 mt-4">
      <div className="flex items-center justify-between px-3">
        <h2
          id="playlists-heading"
          className="text-sm font-medium text-neutral-500"
        >
          Playlists
        </h2>
        <button
          type="button"
          onClick={onCreate}
          aria-label="New playlist"
          className="text-neutral-500 hover:text-white transition"
        >
          <AiOutlinePlus size={20} aria-hidden="true" />
        </button>
      </div>
      {playlists.length === 0 ? (
        <p className="text-neutral-500 text-xs pl-3 mt-2">
          Create a playlist to group songs.
        </p>
      ) : (
        <ul className="mt-2 flex flex-col">
          {playlists.map((playlist) => {
            const href = `/playlist/${playlist.id}`;
            const active = pathname === href;
            return (
              <li key={playlist.id}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={twMerge(
                    "flex items-center gap-x-3 rounded-md p-2 text-neutral-400 hover:bg-neutral-800/80 hover:text-white",
                    active && "text-white bg-neutral-800/80",
                  )}
                >
                  <RiPlayListFill size={20} aria-hidden="true" />
                  <span className="truncate">{playlist.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default PlaylistList;
