import { useUser } from "@/hooks/useUser";
import { ISong } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MediaItem from "./MediaItem";
import LikeButton from "./LikeButton";

interface LikedContent {
  songs: ISong[];
}
const LikedSongsContent = ({ songs }: LikedContent) => {
  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, router, user]);

  return (
    <div className="flex flex-col gap-y-2 w-full px-6 ">
      {songs.length === 0 ? (
        <p className="text-neutral-400">No liked songs</p>
      ) : (
        <>
          {songs.map((song) => (
            <div className="flex items-center gap-x-4 w-full" key={song?.id}>
              <div className="flex-1">
                <MediaItem song={song} onClick={() => {}} />
              </div>
              <LikeButton songId={song?.id} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default LikedSongsContent;
