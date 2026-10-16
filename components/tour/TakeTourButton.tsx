"use client";

import { useRouter } from "next/navigation";
import { FiCompass } from "react-icons/fi";
import useTour from "@/hooks/useTour";
import { pillOutline } from "../ui/styles";

// Replays the guided tour, which runs on Home.
const TakeTourButton = () => {
  const router = useRouter();

  const onClick = () => {
    useTour.getState().request();
    router.push("/");
  };

  return (
    <button type="button" onClick={onClick} className={pillOutline}>
      <FiCompass size={16} aria-hidden="true" />
      Take the tour
    </button>
  );
};

export default TakeTourButton;
