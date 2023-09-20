"use client";
import { ISong } from "@/types";
import React from "react";
import SongItem from "../ui/SongItem";
import useOnPlay from "@/hooks/useOnPlay";

interface PageContentProps {
  songs: ISong[];
}
const PageContent = ({ songs }: PageContentProps) => {
  const onPlay = useOnPlay(songs);
  if (songs.length === 0) {
    return (
      <div className="my-4">
        <p className="text-neutral-400">No songs available</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-8 xl:grid-cols-5 gap-4 mt-4">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          onClick={(id: string) => onPlay(id)}
        />
      ))}
    </div>
  );
};

export default PageContent;
