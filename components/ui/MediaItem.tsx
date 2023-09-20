import { defaultImage } from "@/common.constant";
import useLoadImage from "@/hooks/useLoadImage";
import { ISong } from "@/types";
import Image from "next/image";
import React from "react";

interface MediaItemProps {
  onClick: (id: string) => void;
  song: ISong;
}
const MediaItem = ({ onClick, song }: MediaItemProps) => {
  const imageUrl = useLoadImage(song);

  const handleClick = () => {
    if (onClick) {
      return onClick(song.id);
    }
    // TODO: Turn on player
  };
  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-x-3 cursor-pointer hover:bg-neutral-800/80 w-full p-2 rounded-md"
    >
      <div className="relative rounded-md min-h-[50px] max-w-[50px] overflow-hidden h-full w-full">
        <Image
          src={imageUrl || defaultImage}
          alt={"song by " + song?.title}
          className="object-cover"
          fill
        />
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className="text-base md:text-lg truncate text-white">
          {song?.title}
        </p>
        <p className="text-neutral-400 text-sm truncate">{song?.author}</p>
      </div>
    </div>
  );
};

export default MediaItem;
