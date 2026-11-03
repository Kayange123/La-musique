import { notFound } from "next/navigation";
import { getArtistByHandle } from "@/actions";
import ArtistAvatar from "@/components/artist/ArtistAvatar";
import ArtistSongs from "@/components/artist/ArtistSongs";
import CollectionHeader from "@/components/ui/CollectionHeader";
import { parseHandle } from "@/lib/artists";

export const revalidate = 0;

const ArtistPage = async ({
  params,
}: {
  params: Promise<{ handle: string }>;
}) => {
  const handle = parseHandle((await params).handle);
  const artist = handle === null ? null : await getArtistByHandle(handle);
  if (!artist) {
    notFound();
  }

  const { profile, avatarUrl, songs } = artist;
  return (
    <div className="bg-surface rounded-xl h-full w-full overflow-hidden overflow-y-auto">
      <CollectionHeader
        label={
          <>
            Artist · {/* Handles are lowercase; keep them as typed. */}
            <span className="normal-case">@{profile.handle}</span>
          </>
        }
        title={profile.display_name}
        description={profile.bio}
        songCount={songs.length}
        cover={
          <ArtistAvatar
            name={profile.display_name}
            userId={profile.user_id}
            url={avatarUrl}
            className="h-32 w-32 text-5xl shadow-2xl lg:h-44 lg:w-44 lg:text-6xl"
          />
        }
      />
      <ArtistSongs name={profile.display_name} songs={songs} />
    </div>
  );
};

export default ArtistPage;
