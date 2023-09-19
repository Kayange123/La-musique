import { ISong } from "@/types";
import React from "react";

interface MediaItemProps {
  onClick: (id: string) => void;
  song: ISong;
}
const MediaItem = ({ onClick, song }: MediaItemProps) => {
  return <div>MediaItem</div>;
};

export default MediaItem;
