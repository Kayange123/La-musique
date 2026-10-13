"use client";

import SongMenu from "@/components/ui/SongMenu";
import { useUser } from "@/hooks/useUser";
import { ISong } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";
import useOnPlay from "@/hooks/useOnPlay";

interface LikedContent {
  songs: ISong[];
}
const LikedSongsContent = ({ songs }: LikedContent) => {
  const router = useRouter();
  const onPlay = useOnPlay(songs);
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, router, user]);

  return (
    <div className="flex flex-col gap-y-1 w-full px-6 pt-6 pb-10">
      {songs.length === 0 ? (
        <p className="text-muted">
          Songs you like appear here. Tap the heart on any song.
        </p>
      ) : (
        <>
          {songs.map((song) => (
            <div className="flex items-center gap-x-1 w-full" key={song?.id}>
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

export default LikedSongsContent;
