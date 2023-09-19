"use client";

import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import { ISong } from "@/types";
import MediaItem from "../ui/MediaItem";

interface LibraryProps {
  songs: ISong[];
}
const Library = ({ songs }: LibraryProps) => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const uploadModal = useUploadModal();
  const onClick = () => {
    if (!user) {
      return authModal.onOpen();
    }
    uploadModal.onOpen();
  };

  return (
    <div className="flex flex-col">
      <div className="flex px-5 items-center pt-4 justify-between">
        <div className="inline-flex gap-x-2 items-center">
          <TbPlaylist size={25} className="text-neutral-400" />
          <p className="text-base font-medium text-neutral-500">Your library</p>
        </div>
        <AiOutlinePlus
          onClick={onClick}
          size={25}
          className="cursor-pointer text-neutral-500 hover:text-white transition"
        />
      </div>
      <div className="flex-col gap-y-2 mt-4 px-2">
        {songs.length !== 0 ? (
          songs.map((song) => (
            <MediaItem key={song?.id} onClick={() => {}} song={song} />
          ))
        ) : (
          <p>Upload songs to see them here!</p>
        )}
      </div>
    </div>
  );
};

export default Library;
