"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AiOutlinePlus } from "react-icons/ai";
import { twMerge } from "tailwind-merge";
import { IPlaylist } from "@/types";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { tileColor } from "@/lib/theme";
import { eyebrow } from "../ui/styles";

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
      <div className="flex items-center justify-between px-2">
        <h2 id="playlists-heading" className={eyebrow}>
          Playlists
        </h2>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-x-1 rounded-full px-2 py-1.5 text-sm font-semibold text-muted transition hover:text-fg"
        >
          <AiOutlinePlus size={16} aria-hidden="true" />
          New playlist
        </button>
      </div>
      {playlists.length === 0 ? (
        <p className="text-muted text-sm px-2 mt-2">
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
                    "flex items-center gap-x-3 rounded-lg p-2 text-fg transition hover:bg-raised",
                    active && "bg-raised font-semibold",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md font-display text-lg font-bold text-on-accent"
                    style={{ backgroundColor: tileColor(playlist.id) }}
                  >
                    {playlist.name.trim().charAt(0).toUpperCase()}
                  </span>
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
