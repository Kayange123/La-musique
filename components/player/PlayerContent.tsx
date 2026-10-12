"use client";
import { ISong } from "@/types";
import { useEffect, useState } from "react";
import MediaItem from "../ui/MediaItem";
import LikeButton from "../ui/LikeButton";
import { IconType } from "react-icons";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import Slider from "../ui/Slider";
import usePlayer from "@/hooks/usePlayer";
import { getNextId, getPreviousId } from "@/lib/queue";
import useSound from "use-sound";

interface PlayerProps {
  songUrl: string;
  song: ISong;
}
const PlayerContent = ({ song, songUrl }: PlayerProps) => {
  const player = usePlayer();
  const volume = usePlayer((state) => state.volume);
  const setVolume = usePlayer((state) => state.setVolume);
  const toggleMute = usePlayer((state) => state.toggleMute);
  const [isPlaying, setIsPlaying] = useState(false);
  const VolumeIcon: IconType = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;
  const Icon: IconType = isPlaying ? BsPauseFill : BsPlayFill;

  const onPlayNext = () => {
    const nextId = getNextId(player.ids, player.activeId);
    if (nextId !== undefined) {
      player.setId(nextId);
    }
  };
  const onPlayPrevious = () => {
    const previousId = getPreviousId(player.ids, player.activeId);
    if (previousId !== undefined) {
      player.setId(previousId);
    }
  };

  const [play, { pause, sound }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      onPlayNext();
    },
    onpause: () => setIsPlaying(false),
    format: ["mp3"],
  });

  useEffect(() => {
    sound?.play();

    return () => {
      sound?.unload();
    };
  }, [sound]);

  const handlePlay = () => {
    if (!isPlaying) {
      play();
    } else {
      pause();
    }
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      <div className="flex max-w-xs justify-start">
        <div className="flex items-center w-full gap-x-4">
          <MediaItem song={song} onClick={handlePlay} />
          <LikeButton songId={song?.id} />
        </div>
      </div>
      <div className="flex md:hidden col-auto justify-end items-center w-full">
        <div
          onClick={handlePlay}
          className="flex items-center h-10 w-10 justify-center rounded-full bg-white p-1 cursor-pointer"
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>
      <div className="hidden md:flex items-center justify-center h-full w-full max-w-[720px] gap-x-6">
        <AiFillStepBackward
          onClick={onPlayPrevious}
          size={30}
          className="text-neutral-400 cursor-pointer transition hover:text-white"
        />
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer">
          <Icon onClick={handlePlay} size={30} className="text-black" />
        </div>
        <AiFillStepForward
          onClick={onPlayNext}
          size={30}
          className="text-neutral-400 cursor-pointer transition hover:text-white"
        />
      </div>
      <div className="hidden md:flex w-full pr-2 justify-end">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer"
            size={32}
          />
          <Slider value={volume} onChange={(value) => setVolume(value)} />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;
