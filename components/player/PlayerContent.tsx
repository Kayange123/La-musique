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
  const playLabel = isPlaying ? "Pause" : "Play";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      <div className="flex max-w-xs justify-start">
        <div className="flex items-center w-full gap-x-4">
          <MediaItem song={song} onClick={handlePlay} />
          <LikeButton songId={song?.id} />
        </div>
      </div>
      <div className="flex md:hidden col-auto justify-end items-center w-full">
        <button
          type="button"
          onClick={handlePlay}
          aria-label={playLabel}
          className="flex items-center h-10 w-10 justify-center rounded-full bg-white p-1"
        >
          <Icon size={30} className="text-black" />
        </button>
      </div>
      <div className="hidden md:flex items-center justify-center h-full w-full max-w-[720px] gap-x-6">
        <button
          type="button"
          onClick={onPlayPrevious}
          aria-label="Previous song"
          className="text-neutral-400 transition hover:text-white"
        >
          <AiFillStepBackward size={30} />
        </button>
        <button
          type="button"
          onClick={handlePlay}
          aria-label={playLabel}
          className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1"
        >
          <Icon size={30} className="text-black" />
        </button>
        <button
          type="button"
          onClick={onPlayNext}
          aria-label="Next song"
          className="text-neutral-400 transition hover:text-white"
        >
          <AiFillStepForward size={30} />
        </button>
      </div>
      <div className="hidden md:flex w-full pr-2 justify-end">
        <div className="flex items-center gap-x-2 w-[120px]">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            <VolumeIcon size={32} />
          </button>
          <Slider
            label="Volume"
            value={volume}
            onChange={(value) => setVolume(value)}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerContent;
