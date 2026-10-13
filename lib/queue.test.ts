import { describe, expect, it } from "vitest";
import {
  getAutoNextId,
  getNextId,
  getPreviousId,
  nextRepeatMode,
  removeFromQueue,
  shuffleIds,
} from "./queue";

const ids = [3, 2, 1];

describe("getNextId", () => {
  it("moves to the next song in the middle of the queue", () => {
    expect(getNextId(ids, 2)).toBe(1);
  });

  it("wraps to the first song at the end", () => {
    expect(getNextId(ids, 1)).toBe(3);
  });

  it("starts from the first song when the active song isn't queued", () => {
    expect(getNextId(ids, 99)).toBe(3);
    expect(getNextId(ids, undefined)).toBe(3);
  });

  it("returns undefined for an empty queue", () => {
    expect(getNextId([], 1)).toBeUndefined();
  });
});

describe("getPreviousId", () => {
  it("moves to the previous song in the middle of the queue", () => {
    expect(getPreviousId(ids, 2)).toBe(3);
  });

  it("wraps to the last song at the start", () => {
    expect(getPreviousId(ids, 3)).toBe(1);
  });

  it("starts from the last song when the active song isn't queued", () => {
    expect(getPreviousId(ids, 99)).toBe(1);
  });

  it("returns undefined for an empty queue", () => {
    expect(getPreviousId([], 1)).toBeUndefined();
  });

  it("stays on the only song in a single-song queue", () => {
    expect(getNextId([7], 7)).toBe(7);
    expect(getPreviousId([7], 7)).toBe(7);
  });
});

describe("getAutoNextId", () => {
  it("moves on in the middle of the queue in every mode but one", () => {
    expect(getAutoNextId(ids, 2, "off")).toBe(1);
    expect(getAutoNextId(ids, 2, "all")).toBe(1);
  });

  it("wraps at the end with repeat all", () => {
    expect(getAutoNextId(ids, 1, "all")).toBe(3);
  });

  it("stops at the end with repeat off", () => {
    expect(getAutoNextId(ids, 1, "off")).toBeUndefined();
  });

  it("replays the same song with repeat one", () => {
    expect(getAutoNextId(ids, 2, "one")).toBe(2);
    expect(getAutoNextId(ids, 1, "one")).toBe(1);
  });
});

describe("shuffleIds", () => {
  // Always picks index 0, so the result is predictable.
  const first = () => 0;

  it("puts the current song first", () => {
    expect(shuffleIds([1, 2, 3, 4], 3, first)[0]).toBe(3);
  });

  it("keeps every song exactly once", () => {
    const result = shuffleIds([1, 2, 3, 4, 5], 2, Math.random);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("is deterministic for a given random source", () => {
    expect(shuffleIds([1, 2, 3, 4], 1, first)).toEqual([1, 3, 4, 2]);
  });

  it("shuffles everything when there's no current song", () => {
    expect([...shuffleIds([1, 2, 3], undefined, first)].sort()).toEqual([
      1, 2, 3,
    ]);
  });

  it("doesn't mutate the input", () => {
    const input = [1, 2, 3];
    shuffleIds(input, 2, first);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe("nextRepeatMode", () => {
  it("cycles all, one, off", () => {
    expect(nextRepeatMode("all")).toBe("one");
    expect(nextRepeatMode("one")).toBe("off");
    expect(nextRepeatMode("off")).toBe("all");
  });
});

describe("removeFromQueue", () => {
  it("leaves the queue alone when the song isn't in it", () => {
    expect(removeFromQueue([1, 2, 3], 2, 9)).toEqual({
      queue: [1, 2, 3],
      activeId: 2,
    });
  });

  it("keeps playing the current song when another is removed", () => {
    expect(removeFromQueue([1, 2, 3], 2, 3)).toEqual({
      queue: [1, 2],
      activeId: 2,
    });
  });

  it("moves to the next song when the playing one is removed", () => {
    expect(removeFromQueue([1, 2, 3], 2, 2)).toEqual({
      queue: [1, 3],
      activeId: 3,
    });
  });

  it("wraps to the first song when the last one is removed while playing", () => {
    expect(removeFromQueue([1, 2, 3], 3, 3)).toEqual({
      queue: [1, 2],
      activeId: 1,
    });
  });

  it("stops when the only song is removed", () => {
    expect(removeFromQueue([5], 5, 5)).toEqual({
      queue: [],
      activeId: undefined,
    });
  });
});
