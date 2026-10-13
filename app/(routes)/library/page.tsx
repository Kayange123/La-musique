import { getPlaylists, getSongsByUserId } from "@/actions";
import Library from "@/components/Library/Library";
import Heading from "@/components/ui/Heading";

export const revalidate = 0;

// The sidebar library, as its own page for phones.
const LibraryPage = async () => {
  const [songs, playlists] = await Promise.all([
    getSongsByUserId(),
    getPlaylists(),
  ]);
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Heading>
        <h1 className="text-white text-3xl font-semibold">Your library</h1>
      </Heading>
      <Library songs={songs} playlists={playlists} />
    </div>
  );
};

export default LibraryPage;
