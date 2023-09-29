"use client";
import useLoadImage from "@/hooks/useLoadImage";
import { ISong } from "@/types";
import Image from "next/image";
import React from "react";
import PlayButton from "./PlayButton";
import { defaultImage } from "@/common.constant";

interface SongItemProps {
  song: ISong;
  onClick: (id: string) => void;
}
const SongItem = ({ song, onClick }: SongItemProps) => {
  const imagePath = useLoadImage(song);
  return (
    <div
      onClick={() => onClick(song?.id)}
      className="relative group flex flex-col items-center justify-center rounded-md overflow-hidden gap-x-4 bg-neutral-400/5 cursor-pointer hover:bg-neutral-400/10 transition p-3"
    >
      <div className="relative aspect-square rounded-md overflow-hidden h-full w-full">
        <Image
          src={imagePath || defaultImage}
          alt="banner image"
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col items-start w-full pt-4 gap-y-1">
        <p className="font-semibold truncate text-sm w-full">{song?.title}</p>
        <p className="text-neutral-400 text-xs pb-4 w-full truncate">
          By {song?.author}
        </p>
      </div>
      <div className="absolute bottom-24 right-5">
        <PlayButton />
      </div>
    </div>
  );
};

export default SongItem;
