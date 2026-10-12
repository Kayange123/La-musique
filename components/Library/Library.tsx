"use client";

import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import { IPlaylist, ISong } from "@/types";
import PlaylistList from "./PlaylistList";
import MediaItem from "../ui/MediaItem";
import useOnPlay from "@/hooks/useOnPlay";
import useSongActions from "@/hooks/useSongActions";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

interface LibraryProps {
  songs: ISong[];
  playlists: IPlaylist[];
}
const Library = ({ songs, playlists }: LibraryProps) => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const onPlay = useOnPlay(songs);
  const songActions = useSongActions();

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }
    uploadModal.onOpen();
  };

  return (
    <div className="flex flex-col pb-4">
      <PlaylistList playlists={playlists} />
      <div className="flex px-5 items-center pt-4 justify-between">
        <div className="inline-flex gap-x-2 items-center">
          <TbPlaylist size={25} className="text-neutral-400" />
          <p className="text-base font-medium text-neutral-500">Your library</p>
        </div>
        <button
          type="button"
          onClick={onClick}
          aria-label="Upload a song"
          className="text-neutral-500 hover:text-white transition"
        >
          <AiOutlinePlus size={25} />
        </button>
      </div>
      <div className="flex-col gap-y-2 mt-4 px-2">
        {songs.length !== 0 ? (
          songs.map((song) => (
            <div key={song.id} className="group flex items-center gap-x-1">
              <MediaItem onClick={(id: number) => onPlay(id)} song={song} />
              {user?.id === song.user_id && (
                <div className="flex gap-x-1 pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => songActions.openEdit(song)}
                    aria-label={`Edit ${song.title}`}
                    className="p-2 text-neutral-400 hover:text-white"
                  >
                    <FiEdit2 size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => songActions.openDelete(song)}
                    aria-label={`Delete ${song.title}`}
                    className="p-2 text-neutral-400 hover:text-red-400"
                  >
                    <FiTrash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-neutral-500 text-xs pl-3">
            Upload songs to see them here!
          </p>
        )}
      </div>
    </div>
  );
};

export default Library;
