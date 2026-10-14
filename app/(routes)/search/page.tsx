import { getSongsByTitle } from "@/actions";
import Heading from "@/components/ui/Heading";
import SearchContent from "@/components/ui/SearchContent";
import SearchInput from "@/components/ui/SearchInput";

interface PageProps {
  searchParams: Promise<{
    title: string;
  }>;
}
export const revalidate = 0;
const SearchPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const songs = await getSongsByTitle(searchParams.title);
  return (
    <div className="bg-surface rounded-xl w-full h-full overflow-hidden overflow-y-auto">
      <Heading>
        <SearchInput />
      </Heading>
      <SearchContent songs={songs} />
    </div>
  );
};

export default SearchPage;
