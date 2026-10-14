import { notFound } from "next/navigation";
import { getPlaylist } from "@/actions";
import PlaylistCover from "@/components/playlist/PlaylistCover";
import CollectionHeader from "@/components/ui/CollectionHeader";
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
    <div className="bg-surface rounded-xl h-full w-full overflow-hidden overflow-y-auto">
      <CollectionHeader
        label="Playlist · Private"
        title={playlist.name}
        description={playlist.description}
        songCount={entries.length}
        cover={<PlaylistCover urls={coverUrls} />}
      />
      <PlaylistContent playlist={playlist} entries={entries} />
    </div>
  );
};

export default PlaylistPage;
