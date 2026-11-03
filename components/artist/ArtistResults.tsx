import Link from "next/link";
import { IArtistProfile } from "@/types";
import ArtistAvatar from "./ArtistAvatar";
import { sectionTitle } from "../ui/styles";

interface ArtistResultsProps {
  artists: { profile: IArtistProfile; avatarUrl: string | null }[];
}

// Artists matching a search, above the songs. Hidden when none match.
const ArtistResults = ({ artists }: ArtistResultsProps) => {
  if (artists.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="artist-results" className="px-6 pb-6">
      <h2 id="artist-results" className={`${sectionTitle} mb-3`}>
        Artists
      </h2>
      <ul className="flex gap-x-4 overflow-x-auto pb-2">
        {artists.map(({ profile, avatarUrl }) => (
          <li key={profile.user_id} className="shrink-0">
            <Link
              href={`/artist/${profile.handle}`}
              className="flex w-28 flex-col items-center gap-y-2 rounded-xl p-2 text-center transition hover:bg-raised"
            >
              <ArtistAvatar
                name={profile.display_name}
                userId={profile.user_id}
                url={avatarUrl}
                className="h-20 w-20 text-3xl"
              />
              <span className="w-full truncate text-sm font-semibold text-fg">
                {profile.display_name}
              </span>
              <span className="w-full truncate font-mono text-xs text-muted">
                @{profile.handle}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ArtistResults;
