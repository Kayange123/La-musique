"use client";
import useLoadImage from "@/hooks/useLoadImage";
import { ISong } from "@/types";
import Image from "next/image";
import React from "react";
import PlayButton from "./PlayButton";
import { defaultImage } from "@/common.constant";

interface SongItemProps {
  song: ISong;
  onClick: (id: number) => void;
}
const SongItem = ({ song, onClick }: SongItemProps) => {
  const imagePath = useLoadImage(song);
  return (
    <button
      type="button"
      onClick={() => onClick(song?.id)}
      aria-label={`Play ${song?.title} by ${song?.author}`}
      className="group flex flex-col gap-y-2 rounded-xl p-2 -m-2 text-left transition hover:bg-raised"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <Image
          src={imagePath || defaultImage}
          alt=""
          fill
          sizes="(min-width: 1280px) 15vw, (min-width: 768px) 22vw, 45vw"
          className="object-cover"
        />
        <div className="absolute bottom-2 right-2">
          <PlayButton />
        </div>
      </div>
      <p className="w-full truncate font-semibold text-fg">{song?.title}</p>
      <p className="-mt-2 w-full truncate text-sm text-muted">{song?.author}</p>
    </button>
  );
};

export default SongItem;
