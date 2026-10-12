import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_SIZE,
  MAX_SONG_SIZE,
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
  ])("accepts type %j named %j", (type, name) => {
    expect(isValidSong(file(name, type))).toBe(true);
  });

  it("rejects other audio formats", () => {
    expect(isValidSong(file("song.wav", "audio/wav"))).toBe(false);
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
