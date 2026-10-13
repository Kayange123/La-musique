import { describe, expect, it } from "vitest";
import { COUNTED_PLAY_SECONDS, isCountedPlay, latestDistinct } from "./history";

describe("isCountedPlay", () => {
  it("counts a play after enough listening", () => {
    expect(
      isCountedPlay({ listenedSeconds: COUNTED_PLAY_SECONDS, ended: false }),
    ).toBe(true);
    expect(isCountedPlay({ listenedSeconds: 3, ended: false })).toBe(false);
  });

  it("counts a short song that played to the end", () => {
    expect(isCountedPlay({ listenedSeconds: 6, ended: true })).toBe(true);
  });
});

describe("latestDistinct", () => {
  const rows = [
    { song_id: 3, played_at: "t5" },
    { song_id: 1, played_at: "t4" },
    { song_id: 3, played_at: "t3" },
    { song_id: 2, played_at: "t2" },
    { song_id: 1, played_at: "t1" },
  ];

  it("keeps each song once, at its latest play", () => {
    expect(latestDistinct(rows, { limit: 10 })).toEqual([
      { song_id: 3, played_at: "t5" },
      { song_id: 1, played_at: "t4" },
      { song_id: 2, played_at: "t2" },
    ]);
  });

  it("stops at the limit", () => {
    expect(latestDistinct(rows, { limit: 2 }).map((r) => r.song_id)).toEqual([
      3, 1,
    ]);
  });

  it("handles an empty history", () => {
    expect(latestDistinct([], { limit: 5 })).toEqual([]);
  });
});
