"use client";

import { ISong } from "@/types";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import useOnPlay from "@/hooks/useOnPlay";

interface SearchContentProps {
  songs: ISong[];
}

const SearchContent = ({ songs }: SearchContentProps) => {
  const onPlay = useOnPlay(songs);
  return (
    <div className="flex flex-col gap-y-2 w-full py-3 px-6">
      {songs.length === 0 ? (
        <p className="text-neutral-400">No songs found</p>
      ) : (
        <>
          {songs.map((song) => (
            <div key={song?.id} className="flex items-center w-full gap-x-4">
              <div className="flex-1">
                <MediaItem song={song} onClick={(id: string) => onPlay(id)} />
              </div>
              <LikeButton songId={song?.id} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SearchContent;
