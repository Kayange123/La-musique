"use client";

import { BsPlayFill } from "react-icons/bs";
import { ISong } from "@/types";
import useOnPlay from "@/hooks/useOnPlay";
import MediaItem from "../ui/MediaItem";
import LikeButton from "../ui/LikeButton";
import SongMenu from "../ui/SongMenu";
import { playButton, sectionTitle } from "../ui/styles";

// An artist's songs, newest first, with play all.
const ArtistSongs = ({ name, songs }: { name: string; songs: ISong[] }) => {
  const onPlay = useOnPlay(songs);

  return (
    <div className="flex flex-col gap-y-4 px-6 pt-6 pb-10">
      <div className="flex items-center gap-x-4">
        {songs.length > 0 && (
          <button
            type="button"
            onClick={() => onPlay(songs[0].id)}
            aria-label={`Play songs by ${name}`}
            className={`${playButton} h-14 w-14`}
          >
            <BsPlayFill size={28} aria-hidden="true" />
          </button>
        )}
        <h2 className={sectionTitle}>Songs</h2>
      </div>
      {songs.length === 0 ? (
        <p className="text-muted">{name} hasn&apos;t uploaded any songs yet.</p>
      ) : (
        <ul className="flex flex-col gap-y-1">
          {songs.map((song) => (
            <li key={song.id} className="flex items-center gap-x-1">
              <MediaItem song={song} onClick={(id) => onPlay(id)} />
              <LikeButton songId={song.id} />
              <SongMenu song={song} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArtistSongs;
