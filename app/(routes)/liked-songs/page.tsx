import { getLikedSongs } from "@/actions";
import { defaultImage } from "@/common.constant";
import Heading from "@/components/ui/Heading";
import LikedSongsContent from "@/components/ui/LikedSongsContent";
import Image from "next/image";
import React from "react";

export const revalidate = 0;
const LikedSongs = async () => {
  const songs = await getLikedSongs();
  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Heading>
        <div className="mt-20">
          <div className="flex flex-col md:flex-row items-center gap-y-5">
            <div className="relative h-32 w-32 lg:h-44 lg:w-44">
              <Image
                src={defaultImage}
                alt="playlist"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">playlist</p>
              <h1 className="text-white text-3xl font-bold lg:text-7xl md:text-4xl">
                Liked Songs
              </h1>
            </div>
          </div>
        </div>
      </Heading>
      <LikedSongsContent songs={songs} />
    </div>
  );
};

export default LikedSongs;
