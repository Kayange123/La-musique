"use client";

import { useEffect, useState } from "react";
import Slider from "../ui/Slider";
import { formatTime } from "@/lib/time";

interface Seekable {
  seek(): number;
  seek(position: number): unknown;
  duration(): number;
}

interface SeekBarProps {
  sound: Seekable | null;
  isPlaying: boolean;
}

// Howler has no time-update event, so poll the position while playing.
const POLL_MS = 250;

const SeekBar = ({ sound, isPlaying }: SeekBarProps) => {
  const [position, setPosition] = useState(0);
  // Set while the user drags, so polling doesn't pull the thumb back.
  const [dragValue, setDragValue] = useState<number | null>(null);

  useEffect(() => {
    if (!sound || !isPlaying) {
      return;
    }
    const timer = setInterval(() => setPosition(sound.seek()), POLL_MS);
    return () => clearInterval(timer);
  }, [sound, isPlaying]);

  const duration = sound?.duration() ?? 0;
  const shown = dragValue ?? position;

  const commit = (value: number) => {
    sound?.seek(value);
    setPosition(value);
    setDragValue(null);
  };

  return (
    <div className="flex items-center gap-x-2 w-full text-xs text-neutral-400 tabular-nums">
      <span className="w-10 text-right">{formatTime(shown)}</span>
      <Slider
        label="Seek"
        className="h-4"
        value={Math.min(shown, duration)}
        max={duration || 1}
        step={1}
        valueText={`${formatTime(shown)} of ${formatTime(duration)}`}
        onChange={setDragValue}
        onCommit={commit}
      />
      <span className="w-10">{formatTime(duration)}</span>
    </div>
  );
};

export default SeekBar;
