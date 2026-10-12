"use client";
import { ISong } from "@/types";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import MediaItem from "../ui/MediaItem";
import LikeButton from "../ui/LikeButton";
import { IconType } from "react-icons";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import {
  BsPauseFill,
  BsPlayFill,
  BsRepeat,
  BsRepeat1,
  BsShuffle,
} from "react-icons/bs";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import Slider from "../ui/Slider";
import SeekBar from "./SeekBar";
import useLoadImage from "@/hooks/useLoadImage";
import { getShortcutAction } from "@/lib/shortcuts";
import usePlayer from "@/hooks/usePlayer";
import { getAutoNextId, getNextId, getPreviousId } from "@/lib/queue";
import useSound from "use-sound";

interface PlayerProps {
  songUrl: string;
  song: ISong;
}
const PlayerContent = ({ song, songUrl }: PlayerProps) => {
  const imageUrl = useLoadImage(song);
  const volume = usePlayer((state) => state.volume);
  const setVolume = usePlayer((state) => state.setVolume);
  const toggleMute = usePlayer((state) => state.toggleMute);
  const shuffle = usePlayer((state) => state.shuffle);
  const toggleShuffle = usePlayer((state) => state.toggleShuffle);
  const repeat = usePlayer((state) => state.repeat);
  const cycleRepeat = usePlayer((state) => state.cycleRepeat);
  const RepeatIcon: IconType = repeat === "one" ? BsRepeat1 : BsRepeat;
  const [isPlaying, setIsPlaying] = useState(false);
  const VolumeIcon: IconType = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;
  const Icon: IconType = isPlaying ? BsPauseFill : BsPlayFill;

  // Handlers read the store when they run, not from this render, so
  // toggling shuffle or repeat mid-song applies to the current song too.
  const soundRef = useRef<ReturnType<typeof useSound>[1]["sound"]>(null);

  const goTo = (id: number | undefined) => {
    const { activeId, setId } = usePlayer.getState();
    if (id === undefined) {
      return;
    }
    if (id === activeId) {
      // Same song: nothing re-renders, so restart it here.
      soundRef.current?.seek(0);
      soundRef.current?.play();
      return;
    }
    setId(id);
  };

  const onPlayNext = () => {
    const { queue, activeId } = usePlayer.getState();
    goTo(getNextId(queue, activeId));
  };
  const onPlayPrevious = () => {
    const { queue, activeId } = usePlayer.getState();
    goTo(getPreviousId(queue, activeId));
  };

  const [play, { pause, sound }] = useSound(songUrl, {
    volume: volume,
    onplay: () => setIsPlaying(true),
    onend: () => {
      setIsPlaying(false);
      const { queue, activeId, repeat } = usePlayer.getState();
      goTo(getAutoNextId(queue, activeId, repeat));
    },
    onpause: () => setIsPlaying(false),
    format: ["mp3"],
  });

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

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
  const SEEK_STEP = 5;
  const seekBy = (seconds: number) => {
    const current = soundRef.current;
    if (!current) {
      return;
    }
    const target = current.seek() + seconds;
    current.seek(Math.max(0, Math.min(target, current.duration())));
  };

  // Effect events see the latest state without re-subscribing on every
  // render.
  const onShortcut = useEffectEvent((event: KeyboardEvent) => {
    const action = getShortcutAction({
      key: event.key,
      shiftKey: event.shiftKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      altKey: event.altKey,
      target: event.target instanceof HTMLElement ? event.target : null,
    });
    if (!action) {
      return;
    }
    event.preventDefault();
    if (action === "toggle-play") handlePlay();
    if (action === "seek-forward") seekBy(SEEK_STEP);
    if (action === "seek-backward") seekBy(-SEEK_STEP);
    if (action === "next") onPlayNext();
    if (action === "previous") onPlayPrevious();
    if (action === "toggle-mute") toggleMute();
  });

  useEffect(() => {
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);

  // Lock screen, notification and hardware media key controls.
  const onMediaAction = useEffectEvent((details: MediaSessionActionDetails) => {
    if (details.action === "play" && !isPlaying) play();
    if (details.action === "pause" && isPlaying) pause();
    if (details.action === "nexttrack") onPlayNext();
    if (details.action === "previoustrack") onPlayPrevious();
    if (details.action === "seekforward") seekBy(SEEK_STEP);
    if (details.action === "seekbackward") seekBy(-SEEK_STEP);
    if (details.action === "seekto" && details.seekTime !== undefined) {
      soundRef.current?.seek(details.seekTime);
    }
  });

  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title ?? "",
      artist: song.author ?? "",
      artwork: imageUrl ? [{ src: imageUrl }] : [],
    });
    const actions: MediaSessionAction[] = [
      "play",
      "pause",
      "nexttrack",
      "previoustrack",
      "seekforward",
      "seekbackward",
      "seekto",
    ];
    for (const action of actions) {
      try {
        navigator.mediaSession.setActionHandler(action, onMediaAction);
      } catch {
        // Not every browser supports every action.
      }
    }
    return () => {
      for (const action of actions) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {
          // As above.
        }
      }
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    };
  }, [song.title, song.author, imageUrl]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

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
      <div className="hidden md:flex flex-col items-center justify-center h-full w-full max-w-[720px] gap-y-1">
        <div className="flex items-center justify-center gap-x-6">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label="Shuffle"
            aria-pressed={shuffle}
            className={
              shuffle ? "text-green-500" : "text-neutral-400 hover:text-white"
            }
          >
            <BsShuffle size={20} />
          </button>
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
          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={
              repeat === "all"
                ? "Repeat all"
                : repeat === "one"
                  ? "Repeat one"
                  : "Repeat off"
            }
            className={
              repeat === "off"
                ? "text-neutral-400 hover:text-white"
                : "text-green-500"
            }
          >
            <RepeatIcon size={20} />
          </button>
        </div>
        <SeekBar sound={sound} isPlaying={isPlaying} />
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
