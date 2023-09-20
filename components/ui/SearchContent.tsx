import { ISong } from "@/types";
import React from "react";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";

interface SearchContentProps {
  songs: ISong[];
}

const SearchContent = ({ songs }: SearchContentProps) => {
  return (
    <div className="flex flex-col gap-y-2 w-full py-6">
      {songs.length === 0 ? (
        <p className="text-neutral-400">No songs found</p>
      ) : (
        <>
          {songs.map((song) => (
            <div key={song?.id} className="flex items-center w-full gap-x-4">
              <div className="flex-1">
                <MediaItem song={song} onClick={() => {}} />
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
