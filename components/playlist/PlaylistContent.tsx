"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiArrowDown, FiArrowUp, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { BsPlayFill } from "react-icons/bs";
import { IPlaylist, ISong } from "@/types";
import MediaItem from "../ui/MediaItem";
import LikeButton from "../ui/LikeButton";
import SongMenu from "../ui/SongMenu";
import useOnPlay from "@/hooks/useOnPlay";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { useSupabase } from "@/providers/Supabase";
import { removeSongFromPlaylist } from "@/lib/playlists";
import { setSongPosition } from "@/lib/playlistDetails";
import {
  PlaylistEntry,
  PlaylistSort,
  SORT_LABELS,
  positionForMove,
  sortEntries,
} from "@/lib/playlistOrder";

interface PlaylistContentProps {
  playlist: IPlaylist;
  entries: PlaylistEntry[];
}

const iconButtonClass =
  "p-2 rounded-full text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400";

const PlaylistContent = ({ playlist, entries }: PlaylistContentProps) => {
  const router = useRouter();
  const [sort, setSort] = useState<PlaylistSort>("custom");
  const [isMoving, setIsMoving] = useState(false);
  const { openEdit, openDelete } = usePlaylistDialog();
  const { supabaseClient } = useSupabase();

  // Playing follows whatever order is on screen.
  const shown = sortEntries(entries, sort);
  const songs = shown.map((entry) => entry.song);
  const onPlay = useOnPlay(songs);
  const canReorder = sort === "custom" && entries.length > 1;

  const onMove = async (song: ISong, offset: -1 | 1) => {
    const position = positionForMove(shown, { songId: song.id, offset });
    if (position === null) {
      return;
    }
    setIsMoving(true);
    try {
      await setSongPosition(supabaseClient, {
        playlistId: playlist.id,
        songId: song.id,
        position,
      });
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsMoving(false);
    }
  };

  // Takes the song out of this playlist only. The play queue is left as
  // it is: the song still exists and can finish playing.
  const onRemove = async (song: ISong) => {
    try {
      await removeSongFromPlaylist(supabaseClient, {
        playlistId: playlist.id,
        songId: song.id,
      });
      toast.success(`Removed ${song.title}`);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 px-6 pb-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => songs[0] && onPlay(songs[0].id)}
          disabled={songs.length === 0}
          aria-label={`Play ${playlist.name}`}
          className="rounded-full bg-green-500 p-3 text-black transition hover:scale-105 disabled:opacity-50"
        >
          <BsPlayFill size={28} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => openEdit(playlist)}
          className="flex items-center gap-x-2 rounded-full border border-neutral-600 px-4 py-2 text-sm font-semibold hover:border-white"
        >
          <FiEdit2 size={16} aria-hidden="true" />
          Edit details
        </button>
        <label className="ml-auto flex items-center gap-x-2 text-sm text-neutral-400">
          Sort
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as PlaylistSort)}
            className="rounded-md border border-neutral-600 bg-neutral-800 px-2 py-2 text-white"
          >
            {(Object.keys(SORT_LABELS) as PlaylistSort[]).map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => openDelete(playlist)}
          aria-label="Delete playlist"
          className="p-2 text-neutral-400 hover:text-red-400"
        >
          <FiTrash2 size={20} aria-hidden="true" />
        </button>
      </div>
      {sort !== "custom" && entries.length > 1 && (
        <p className="text-sm text-neutral-400">
          Switch to Custom order to rearrange songs.
        </p>
      )}
      {songs.length === 0 ? (
        <p className="text-neutral-400">
          No songs yet. Use a song&apos;s menu or the playlist button in the
          player to add one.
        </p>
      ) : (
        <ol className="flex flex-col gap-y-2">
          {songs.map((song, index) => (
            <li key={song.id} className="flex items-center gap-x-1">
              {canReorder && (
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => onMove(song, -1)}
                    disabled={isMoving || index === 0}
                    aria-label={`Move ${song.title} up`}
                    className={iconButtonClass}
                  >
                    <FiArrowUp size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(song, 1)}
                    disabled={isMoving || index === songs.length - 1}
                    aria-label={`Move ${song.title} down`}
                    className={iconButtonClass}
                  >
                    <FiArrowDown size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
              <MediaItem song={song} onClick={(id) => onPlay(id)} />
              <LikeButton songId={song.id} />
              <SongMenu song={song} />
              <button
                type="button"
                onClick={() => onRemove(song)}
                aria-label={`Remove ${song.title} from ${playlist.name}`}
                className="p-2 text-neutral-400 hover:text-white"
              >
                <FiX size={20} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default PlaylistContent;
