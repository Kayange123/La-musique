import { describe, expect, it } from "vitest";
import {
  AUDIO_ACCEPT,
  MAX_IMAGE_SIZE,
  MAX_SONG_SIZE,
  getAudioExtension,
  getPlaybackFormat,
  isValidImage,
  isValidSong,
  toSafeFileName,
} from "./upload";

const file = (name: string, type: string, size = 1024) => ({
  name,
  type,
  size,
});

describe("isValidSong", () => {
  it.each([
    ["audio/mpeg", "song.mp3"],
    ["audio/mp3", "song.mp3"],
    ["", "song.mp3"],
    ["", "SONG.MP3"],
    ["audio/mpeg", "song"],
    ["audio/x-m4a", "song.m4a"],
    ["audio/wav", "song.wav"],
    ["", "song.flac"],
    ["audio/ogg", "song.ogg"],
    ["audio/aac", "song.aac"],
  ])("accepts type %j named %j", (type, name) => {
    expect(isValidSong(file(name, type))).toBe(true);
  });

  it("rejects unsupported formats", () => {
    expect(isValidSong(file("song.wma", "audio/x-ms-wma"))).toBe(false);
    expect(isValidSong(file("song.mp3.exe", "application/octet-stream"))).toBe(
      false,
    );
  });

  it("rejects songs over the size limit", () => {
    expect(isValidSong(file("song.mp3", "audio/mpeg", MAX_SONG_SIZE + 1))).toBe(
      false,
    );
    expect(isValidSong(file("song.mp3", "audio/mpeg", MAX_SONG_SIZE))).toBe(
      true,
    );
  });
});

describe("getAudioExtension", () => {
  it("prefers the file name over the reported type", () => {
    expect(getAudioExtension(file("song.m4a", "audio/mp4"))).toBe("m4a");
    expect(getAudioExtension(file("song.FLAC", ""))).toBe("flac");
  });

  it("falls back to the reported type", () => {
    expect(getAudioExtension(file("recording", "audio/x-wav"))).toBe("wav");
  });

  it("returns null for unsupported files", () => {
    expect(getAudioExtension(file("notes.txt", "text/plain"))).toBeNull();
  });
});

describe("getPlaybackFormat", () => {
  it("reads the format from the stored path", () => {
    expect(getPlaybackFormat("song-intro-abc123.flac")).toBe("flac");
    expect(getPlaybackFormat("song-intro-abc123.m4a")).toBe("m4a");
  });

  it("treats older paths without an extension as mp3", () => {
    expect(getPlaybackFormat("song-song-one-intro-mv58im9k")).toBe("mp3");
    expect(getPlaybackFormat("song-two-2")).toBe("mp3");
  });
});

describe("AUDIO_ACCEPT", () => {
  it("lists every supported extension for the file picker", () => {
    expect(AUDIO_ACCEPT).toBe(".mp3,.m4a,.aac,.wav,.ogg,.flac");
  });
});

describe("isValidImage", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/gif"])(
    "accepts %s",
    (type) => {
      expect(isValidImage(file("cover", type))).toBe(true);
    },
  );

  it("rejects SVG, which can carry scripts", () => {
    expect(isValidImage(file("cover.svg", "image/svg+xml"))).toBe(false);
  });

  it("rejects images over the size limit", () => {
    expect(
      isValidImage(file("cover.png", "image/png", MAX_IMAGE_SIZE + 1)),
    ).toBe(false);
  });
});

describe("toSafeFileName", () => {
  it("replaces path separators and punctuation", () => {
    expect(toSafeFileName("Song One / Intro?")).toBe("song-one-intro");
    expect(toSafeFileName("../../etc/passwd")).toBe("etc-passwd");
  });

  it("strips accents instead of dropping letters", () => {
    expect(toSafeFileName("Café Señorita")).toBe("cafe-senorita");
  });

  it("falls back when nothing usable is left", () => {
    expect(toSafeFileName("???")).toBe("untitled");
    expect(toSafeFileName("")).toBe("untitled");
  });

  it("limits the length", () => {
    expect(toSafeFileName("a".repeat(80))).toHaveLength(50);
  });
});
