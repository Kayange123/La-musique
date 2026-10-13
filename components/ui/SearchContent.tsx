"use client";

import SongMenu from "@/components/ui/SongMenu";
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
    <div className="flex flex-col gap-y-1 w-full px-6 pb-10">
      {songs.length === 0 ? (
        <p className="text-muted">No songs match that title.</p>
      ) : (
        <>
          {songs.map((song) => (
            <div key={song?.id} className="flex items-center w-full gap-x-1">
              <div className="flex-1 min-w-0">
                <MediaItem song={song} onClick={(id: number) => onPlay(id)} />
              </div>
              <LikeButton songId={song?.id} />
              <SongMenu song={song} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default SearchContent;
