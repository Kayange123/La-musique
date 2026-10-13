import { FaPlay } from "react-icons/fa";

// Decorative: the whole song card is the button.
const PlayButton = () => {
  return (
    <div
      aria-hidden="true"
      className="grid h-11 w-11 place-items-center rounded-full bg-accent text-on-accent shadow-lg transition opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0"
    >
      <FaPlay size={14} className="ml-0.5" />
    </div>
  );
};

export default PlayButton;
