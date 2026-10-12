import { notFound } from "next/navigation";
import Image from "next/image";
import { getPlaylist } from "@/actions";
import { defaultImage } from "@/common.constant";
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

  const { playlist, songs } = result;
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Heading>
        <div className="mt-20 flex flex-col md:flex-row items-center gap-5">
          <div className="relative h-32 w-32 lg:h-44 lg:w-44">
            <Image src={defaultImage} alt="" fill className="object-cover" />
          </div>
          <div className="flex flex-col gap-y-2">
            <p className="hidden md:block font-semibold text-sm">Playlist</p>
            <h1 className="text-white text-3xl md:text-5xl font-bold break-words">
              {playlist.name}
            </h1>
            <p className="text-neutral-400 text-sm">
              {songs.length} {songs.length === 1 ? "song" : "songs"}
            </p>
          </div>
        </div>
      </Heading>
      <PlaylistContent playlist={playlist} songs={songs} />
    </div>
  );
};

export default PlaylistPage;
