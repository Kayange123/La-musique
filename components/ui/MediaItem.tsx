"use client";

import { defaultImage } from "@/common.constant";
import useLoadImage from "@/hooks/useLoadImage";
import { ISong } from "@/types";
import Image from "next/image";

interface MediaItemProps {
  onClick: (id: number) => void;
  song: ISong;
  wrapTitle?: boolean;
}
const MediaItem = ({ onClick, song, wrapTitle = false }: MediaItemProps) => {
  // The player shows long titles on two lines instead of cutting them off.
  const titleClass = wrapTitle ? "line-clamp-2 leading-tight" : "truncate";
  const imageUrl = useLoadImage(song);

  const handleClick = () => {
    if (onClick) {
      return onClick(song.id);
    }
    // TODO: Turn on player
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-1 min-w-0 text-left items-center gap-x-3 cursor-pointer hover:bg-raised p-2 rounded-lg transition"
    >
      <div className="relative rounded-md h-12 w-12 shrink-0 overflow-hidden">
        <Image
          src={imageUrl || defaultImage}
          alt=""
          className="object-cover"
          fill
        />
      </div>
      <div className="flex flex-col overflow-hidden">
        <p className={`font-medium text-fg ${titleClass}`}>{song?.title}</p>
        <p className="text-muted text-sm truncate">{song?.author}</p>
      </div>
    </button>
  );
};

export default MediaItem;
