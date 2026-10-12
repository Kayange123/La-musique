"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { BsPlayFill } from "react-icons/bs";
import { IPlaylist, ISong } from "@/types";
import MediaItem from "../ui/MediaItem";
import LikeButton from "../ui/LikeButton";
import useOnPlay from "@/hooks/useOnPlay";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { useSupabase } from "@/providers/Supabase";
import { removeSongFromPlaylist } from "@/lib/playlists";

interface PlaylistContentProps {
  playlist: IPlaylist;
  songs: ISong[];
}

const PlaylistContent = ({ playlist, songs }: PlaylistContentProps) => {
  const router = useRouter();
  const onPlay = useOnPlay(songs);
  const { openRename, openDelete } = usePlaylistDialog();
  const { supabaseClient } = useSupabase();

  // Takes the song out of this playlist only. The play queue is left as
  // it is: the song still exists and can finish playing.
  const onRemove = async (song: ISong) => {
    try {
      await removeSongFromPlaylist(supabaseClient, playlist.id, song.id);
      toast.success(`Removed ${song.title}`);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-y-4 px-6 pb-6">
      <div className="flex items-center gap-x-3">
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
          onClick={() => openRename(playlist)}
          aria-label="Rename playlist"
          className="p-2 text-neutral-400 hover:text-white"
        >
          <FiEdit2 size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => openDelete(playlist)}
          aria-label="Delete playlist"
          className="p-2 text-neutral-400 hover:text-red-400"
        >
          <FiTrash2 size={20} aria-hidden="true" />
        </button>
      </div>
      {songs.length === 0 ? (
        <p className="text-neutral-400">
          No songs yet. Use the playlist button in the player to add the song
          that&apos;s playing.
        </p>
      ) : (
        <ul className="flex flex-col gap-y-2">
          {songs.map((song) => (
            <li key={song.id} className="flex items-center gap-x-2">
              <MediaItem song={song} onClick={(id) => onPlay(id)} />
              <LikeButton songId={song.id} />
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
        </ul>
      )}
    </div>
  );
};

export default PlaylistContent;
