import { getSongsByTitle, searchArtists } from "@/actions";
import ArtistResults from "@/components/artist/ArtistResults";
import Heading from "@/components/ui/Heading";
import SearchContent from "@/components/ui/SearchContent";
import SearchInput from "@/components/ui/SearchInput";

interface PageProps {
  searchParams: Promise<{
    title?: string;
  }>;
}
export const revalidate = 0;
const SearchPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const query = searchParams.title ?? "";
  const [songs, artists] = await Promise.all([
    getSongsByTitle(query),
    searchArtists(query),
  ]);
  return (
    <div className="bg-surface rounded-xl w-full h-full overflow-hidden overflow-y-auto">
      <Heading>
        <SearchInput />
      </Heading>
      <ArtistResults artists={artists} />
      <SearchContent songs={songs} />
    </div>
  );
};

export default SearchPage;
