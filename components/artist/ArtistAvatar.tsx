import Image from "next/image";
import { twMerge } from "tailwind-merge";
import { tileColorFor } from "@/lib/theme";

// A round avatar: the uploaded image, or the name's initial on a tile
// colour that stays the same for each artist.
const ArtistAvatar = ({
  name,
  userId,
  url,
  className,
}: {
  name: string;
  userId: string;
  url: string | null;
  className?: string;
}) => (
  <div
    aria-hidden="true"
    className={twMerge(
      "relative grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-bold text-on-accent",
      className,
    )}
    style={url ? undefined : { backgroundColor: tileColorFor(userId) }}
  >
    {url ? (
      <Image src={url} alt="" fill sizes="176px" className="object-cover" />
    ) : (
      name.trim().charAt(0).toUpperCase()
    )}
  </div>
);

export default ArtistAvatar;
