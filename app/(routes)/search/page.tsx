import { getSongsByTitle } from "@/actions";
import Heading from "@/components/ui/Heading";
import SearchContent from "@/components/ui/SearchContent";
import SearchInput from "@/components/ui/SearchInput";

interface PageProps {
  searchParams: {
    title: string;
  };
}
export const revalidate = 0;
const SearchPage = async ({ searchParams }: PageProps) => {
  const songs = await getSongsByTitle(searchParams.title);
  return (
    <div className="bg-neutral-900 rounded-lg w-full h-full overflow-hidden overflow-y-auto">
      <Heading className="from-bg-neutral-900">
        <div className="flex flex-col mb-2 gap-y-6">
          <h1 className="text-white text-xl font-semibold">Search</h1>
          <SearchInput />
        </div>
      </Heading>
      <SearchContent songs={songs} />
    </div>
  );
};

export default SearchPage;
