"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RiPlayListFill } from "react-icons/ri";
import Modal from "./Modal";
import PlaylistNameForm from "./PlaylistNameForm";
import usePlaylistDialog from "@/hooks/usePlaylistDialog";
import { useSupabase } from "@/providers/Supabase";
import { useUser } from "@/hooks/useUser";
import { IPlaylist } from "@/types";
import {
  addSongToPlaylist,
  createPlaylist,
  listPlaylists,
} from "@/lib/playlists";

const AddToPlaylistForm = ({ songId }: { songId: number }) => {
  const { close } = usePlaylistDialog();
  const { supabaseClient } = useSupabase();
  const { user } = useUser();
  const router = useRouter();
  const [playlists, setPlaylists] = useState<IPlaylist[] | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }
    let cancelled = false;
    listPlaylists(supabaseClient, user.id)
      .then((result) => !cancelled && setPlaylists(result))
      .catch((error: Error) => toast.error(error.message));
    return () => {
      cancelled = true;
    };
  }, [supabaseClient, user]);

  const addTo = async (playlistId: number, name: string) => {
    try {
      await addSongToPlaylist(supabaseClient, playlistId, songId);
      close();
      toast.success(`Added to ${name}`);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const createAndAdd = async (name: string) => {
    try {
      const id = await createPlaylist(supabaseClient, name);
      await addTo(id, name.trim());
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      {playlists === null ? (
        <p className="text-neutral-400 text-sm">Loading playlists...</p>
      ) : playlists.length > 0 ? (
        <ul className="flex flex-col max-h-60 overflow-y-auto">
          {playlists.map((playlist) => (
            <li key={playlist.id}>
              <button
                type="button"
                onClick={() => addTo(playlist.id, playlist.name)}
                className="flex w-full items-center gap-x-3 rounded-md p-2 text-left hover:bg-neutral-700"
              >
                <RiPlayListFill size={20} aria-hidden="true" />
                <span className="truncate">{playlist.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-neutral-400 text-sm">
          You don&apos;t have any playlists yet.
        </p>
      )}
      <div className="border-t border-neutral-700 pt-3">
        <p className="text-sm mb-2">Or create a new one:</p>
        <PlaylistNameForm
          submitLabel="Create and add"
          onSubmit={createAndAdd}
        />
      </div>
    </div>
  );
};

const AddToPlaylistModal = () => {
  const { mode, songId, close } = usePlaylistDialog();

  return (
    <Modal
      isopen={mode === "add-song"}
      onChange={(open) => !open && close()}
      title="Add to playlist"
      description="Choose a playlist for this song."
    >
      {mode === "add-song" && songId !== null && (
        <AddToPlaylistForm key={songId} songId={songId} />
      )}
    </Modal>
  );
};

export default AddToPlaylistModal;
