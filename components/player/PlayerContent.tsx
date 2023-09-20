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

//import conflicts with ts, since package has no types
const useSound = require("use-sound");

("use client");

interface PlayerProps {
  songUrl: string;
  song: ISong;
}
const PlayerContent = ({ song, songUrl }: PlayerProps) => {
  const player = usePlayer();
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const VolumeIcon: IconType = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;
  const Icon: IconType = isPlaying ? BsPauseFill : BsPlayFill;

  const onPlayNext = () => {
    if (player?.ids.length === 0) {
      return;
    }
    const currentId = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentId + 1];
    if (!nextSong) {
      player.setId(player.ids[0]);
    }
    return nextSong;
  };
  const onPlayPrevious = () => {
    if (player?.ids.length === 0) {
      return;
    }
    const currentId = player.ids.findIndex((id) => id === player.activeId);
    const prevSong = player.ids[currentId - 1];
    if (!prevSong) {
      player.setId(player.ids[player.ids.length - 1]);
    }
    return prevSong;
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
  const toggleMute = () => {
    if (volume === 1) {
      setVolume(0);
    } else {
      setVolume(1);
    }
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
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
          <Icon size={30} className="text-black" />
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
