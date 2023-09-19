import { getSongs } from "@/actions";
import PageContent from "@/components/pageContent/PageContent";
import Heading from "@/components/ui/Heading";
import ListItem from "@/components/ui/ListItem";

export default async function Home() {
  const songs = await getSongs();
  console.log(songs);
  return (
    <div className="bg-neutral-900 w-full h-full rounded-lg overflow-hidden overflow-y-auto">
      <Heading>
        <div className="mb-2">
          <h1 className="text-white text-lg md:text-3xl font-semibold">
            Welcome back
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <ListItem image="" href="" name="Liked songs" />
          </div>
        </div>
      </Heading>
      <div className="mt-2 mb-7 px-6">
        <div className="flex justify-between items-center">
          <h1 className="text-white font-semibold text-base md:text-2xl">
            Latest songs
          </h1>
        </div>
        <PageContent songs={songs} />
      </div>
    </div>
  );
}
