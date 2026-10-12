import { FaPlay } from "react-icons/fa";

// Decorative: the whole song card is the button.
const PlayButton = () => {
  return (
    <div
      aria-hidden="true"
      className="transition opacity-0 rounded-full flex items-center bg-green-500 p-4 drop-shadow-md translate translate-y-1/4 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:translate-y-0 hover:scale-110"
    >
      <FaPlay className="text-black" />
    </div>
  );
};

export default PlayButton;
