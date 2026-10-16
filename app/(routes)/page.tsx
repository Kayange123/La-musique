import { getPlaylists, getRecentlyPlayed, getSongs } from "@/actions";
import ResumeCard from "@/components/home/ResumeCard";
import RecentlyPlayed from "@/components/home/RecentlyPlayed";
import PageContent from "@/components/pageContent/PageContent";
import Heading from "@/components/ui/Heading";
import LikedCover from "@/components/ui/LikedCover";
import ListItem from "@/components/ui/ListItem";
import { pageTitle, sectionTitle } from "@/components/ui/styles";
import { tileColor } from "@/lib/theme";

export const revalidate = 0;

// Shortcuts show Liked songs and the first few playlists.
const PLAYLIST_SHORTCUTS = 5;

export default async function Home() {
  const [songs, recentlyPlayed, playlists] = await Promise.all([
    getSongs(),
    getRecentlyPlayed(),
    getPlaylists(),
  ]);

  return (
    <div className="bg-surface w-full h-full rounded-xl overflow-hidden overflow-y-auto">
      <Heading>
        <h1 className={pageTitle}>Welcome back</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-6">
          <ListItem
            href="/liked-songs"
            name="Liked songs"
            art={<LikedCover className="h-full w-full" />}
          />
          {playlists.slice(0, PLAYLIST_SHORTCUTS).map((playlist) => (
            <ListItem
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              name={playlist.name}
              art={
                <div
                  aria-hidden="true"
                  className="grid h-full w-full place-items-center font-display text-2xl font-bold text-on-accent"
                  style={{ backgroundColor: tileColor(playlist.id) }}
                >
                  {playlist.name.trim().charAt(0).toUpperCase()}
                </div>
              }
            />
          ))}
        </div>
      </Heading>
      <div className="px-6 flex flex-col gap-y-10 pb-10">
        <ResumeCard />
        <RecentlyPlayed songs={recentlyPlayed} />
        <section aria-labelledby="latest-heading">
          {/* The tour points here; the section itself can be very tall. */}
          <h2
            id="latest-heading"
            data-tour="new-songs"
            className={sectionTitle}
          >
            New on La-musique
          </h2>
          <PageContent songs={songs} />
        </section>
      </div>
    </div>
  );
}
