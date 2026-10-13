import { AiFillHeart } from "react-icons/ai";
import { twMerge } from "tailwind-merge";

// The Liked songs cover: an orange square with a heart.
const LikedCover = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={twMerge(
      "grid place-items-center bg-accent text-on-accent",
      className,
    )}
  >
    <AiFillHeart className="h-1/2 w-1/2" />
  </div>
);

export default LikedCover;
