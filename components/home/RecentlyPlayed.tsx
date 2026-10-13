"use client";

import { ISong } from "@/types";
import { useUser } from "@/hooks/useUser";
import PageContent from "../pageContent/PageContent";

// "Jump back in". The songs come from the server, but the section is also
// hidden in the browser as soon as nobody is signed in, so a previous
// user's history never stays on screen after logging out.
const RecentlyPlayed = ({ songs }: { songs: ISong[] }) => {
  const { user } = useUser();

  if (!user || songs.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recent-heading">
      <h2
        id="recent-heading"
        className="text-white font-semibold text-base md:text-2xl"
      >
        Jump back in
      </h2>
      <PageContent songs={songs} />
    </section>
  );
};

export default RecentlyPlayed;
