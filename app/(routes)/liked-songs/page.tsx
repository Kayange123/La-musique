import { getLikedSongs } from "@/actions";
import CollectionHeader from "@/components/ui/CollectionHeader";
import LikedCover from "@/components/ui/LikedCover";
import LikedSongsContent from "@/components/ui/LikedSongsContent";

export const revalidate = 0;
const LikedSongs = async () => {
  const songs = await getLikedSongs();
  return (
    <div className="bg-surface rounded-xl h-full w-full overflow-hidden overflow-y-auto">
      <CollectionHeader
        label="Playlist"
        title="Liked songs"
        songCount={songs.length}
        cover={<LikedCover className="h-32 w-32 rounded-lg lg:h-44 lg:w-44" />}
      />
      <LikedSongsContent songs={songs} />
    </div>
  );
};

export default LikedSongs;
