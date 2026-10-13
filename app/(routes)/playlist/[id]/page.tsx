import { notFound } from "next/navigation";
import { getPlaylist } from "@/actions";
import PlaylistCover from "@/components/playlist/PlaylistCover";
import Heading from "@/components/ui/Heading";
import PlaylistContent from "@/components/playlist/PlaylistContent";
import { parsePlaylistId } from "@/lib/playlists";

export const revalidate = 0;

const PlaylistPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const id = parsePlaylistId((await params).id);
  // Missing and someone else's playlist look the same: RLS hides the
  // latter, so the page never reveals whether a playlist exists.
  const result = id === null ? null : await getPlaylist(id);
  if (!result) {
    notFound();
  }

  const { playlist, entries, coverUrls } = result;
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Heading>
        <div className="mt-20 flex flex-col md:flex-row items-center gap-5">
          <PlaylistCover urls={coverUrls} />
          <div className="flex flex-col gap-y-2">
            <p className="hidden md:block font-semibold text-sm">Playlist</p>
            <h1 className="text-white text-3xl md:text-5xl font-bold break-words">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-neutral-300 max-w-prose">
                {playlist.description}
              </p>
            )}
            <p className="text-neutral-400 text-sm">
              {entries.length} {entries.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>
      </Heading>
      <PlaylistContent playlist={playlist} entries={entries} />
    </div>
  );
};

export default PlaylistPage;
