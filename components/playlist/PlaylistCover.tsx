import Image from "next/image";
import { defaultImage } from "@/common.constant";

// An uploaded cover, a 2x2 mosaic of the first songs' covers, or the
// default image for an empty playlist.
const PlaylistCover = ({
  urls,
  className = "h-32 w-32 lg:h-44 lg:w-44",
}: {
  urls: string[];
  className?: string;
}) => {
  const tiles = urls.length >= 4 ? urls.slice(0, 4) : urls.slice(0, 1);
  const sources = tiles.length > 0 ? tiles : [defaultImage];

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md shadow-lg grid ${
        sources.length === 4 ? "grid-cols-2" : "grid-cols-1"
      } ${className}`}
    >
      {sources.map((src, index) => (
        <div key={`${src}-${index}`} className="relative">
          <Image src={src} alt="" fill sizes="176px" className="object-cover" />
        </div>
      ))}
    </div>
  );
};

export default PlaylistCover;
