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
        <p className="text-muted">No songs yet.</p>
      </div>
    );
  }
  return (
    <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-5 gap-y-6">
      {songs.map((song) => (
        <SongItem
          key={song.id}
          song={song}
          onClick={(id: number) => onPlay(id)}
        />
      ))}
    </div>
  );
};

export default PageContent;
