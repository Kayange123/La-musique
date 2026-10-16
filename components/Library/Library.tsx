"use client";

import SongMenu from "@/components/ui/SongMenu";
import { AiOutlinePlus } from "react-icons/ai";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import { IPlaylist, ISong } from "@/types";
import PlaylistList from "./PlaylistList";
import MediaItem from "../ui/MediaItem";
import useOnPlay from "@/hooks/useOnPlay";
import { eyebrow, roundIconButton } from "../ui/styles";

interface LibraryProps {
  songs: ISong[];
  playlists: IPlaylist[];
}
const Library = ({ songs, playlists }: LibraryProps) => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const onPlay = useOnPlay(songs);

  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }
    uploadModal.onOpen();
  };

  return (
    <div className="flex flex-col pb-4">
      <PlaylistList playlists={playlists} />
      <div className="flex px-4 items-center pt-5 justify-between">
        <h2 className={eyebrow}>Your uploads</h2>
        <button
          type="button"
          onClick={onClick}
          aria-label="Upload a song"
          data-tour="upload"
          className={roundIconButton}
        >
          <AiOutlinePlus size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-col gap-y-2 mt-4 px-2">
        {songs.length !== 0 ? (
          songs.map((song) => (
            <div key={song.id} className="flex items-center gap-x-1">
              <MediaItem onClick={(id: number) => onPlay(id)} song={song} />
              <SongMenu song={song} />
            </div>
          ))
        ) : (
          <p className="text-muted text-sm px-2">
            Songs you upload appear here.
          </p>
        )}
      </div>
    </div>
  );
};

export default Library;
