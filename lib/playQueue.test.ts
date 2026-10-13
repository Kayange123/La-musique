import { describe, expect, it } from "vitest";
import {
  PlaybackState,
  QueuedItem,
  advance,
  goBack,
  moveQueued,
  queueSong,
  removeSongEverywhere,
  upcomingFromList,
} from "./playQueue";

const item = (songId: number, key = `k${songId}`): QueuedItem => ({
  key,
  songId,
});

// Playing song 2 from the list [1, 2, 3, 4], nothing queued.
const base: PlaybackState = {
  queue: [1, 2, 3, 4],
  contextId: 2,
  activeId: 2,
  upNext: [],
  repeat: "all",
};

describe("advance", () => {
  it("continues the list when nothing is queued", () => {
    expect(advance(base, { reason: "manual" })).toMatchObject({
      activeId: 3,
      contextId: 3,
      restart: false,
    });
  });

  it("plays queued songs before the list, keeping the list cursor", () => {
    const state = { ...base, upNext: [item(9), item(8)] };
    const next = advance(state, { reason: "manual" });
    expect(next).toMatchObject({ activeId: 9, contextId: 2 });
    expect(next?.upNext).toEqual([item(8)]);
  });

  it("resumes the list after the cursor once the queue is empty, not from the start", () => {
    // A queued song (9) is playing; the list cursor is still on 2.
    const state = { ...base, activeId: 9, upNext: [] };
    expect(advance(state, { reason: "ended" })).toMatchObject({
      activeId: 3,
      contextId: 3,
    });
  });

  it("replays the song with repeat one when it ends, even with songs queued", () => {
    const state = { ...base, repeat: "one" as const, upNext: [item(9)] };
    expect(advance(state, { reason: "ended" })).toMatchObject({
      activeId: 2,
      restart: true,
      upNext: [item(9)],
    });
  });

  it("still lets next skip forward with repeat one", () => {
    const state = { ...base, repeat: "one" as const };
    expect(advance(state, { reason: "manual" })).toMatchObject({
      activeId: 3,
    });
  });

  it("plays queued songs before stopping at the end with repeat off", () => {
    const atEnd = {
      ...base,
      contextId: 4,
      activeId: 4,
      repeat: "off" as const,
    };
    expect(
      advance({ ...atEnd, upNext: [item(9)] }, { reason: "ended" }),
    ).toMatchObject({ activeId: 9 });
    expect(advance(atEnd, { reason: "ended" })).toBeNull();
  });

  it("wraps at the end with repeat all", () => {
    const atEnd = { ...base, contextId: 4, activeId: 4 };
    expect(advance(atEnd, { reason: "ended" })).toMatchObject({ activeId: 1 });
  });

  it("flags a restart when the next song is the one already playing", () => {
    const single = { ...base, queue: [2], contextId: 2, activeId: 2 };
    expect(advance(single, { reason: "manual" })).toMatchObject({
      activeId: 2,
      restart: true,
    });
  });

  it("follows the shuffled order, since the list is whatever order it plays in", () => {
    const shuffled = { ...base, queue: [2, 4, 1, 3], upNext: [item(9)] };
    const afterQueued = advance(
      { ...shuffled, activeId: 9, upNext: [] },
      { reason: "manual" },
    );
    expect(afterQueued).toMatchObject({ activeId: 4 });
  });
});

describe("goBack", () => {
  it("steps back through the list", () => {
    expect(goBack(base)).toMatchObject({ activeId: 1, contextId: 1 });
  });

  it("from a queued song, returns to the list song it interrupted", () => {
    expect(goBack({ ...base, activeId: 9 })).toMatchObject({
      activeId: 2,
      contextId: 2,
    });
  });

  it("wraps from the first song to the last", () => {
    expect(goBack({ ...base, contextId: 1, activeId: 1 })).toMatchObject({
      activeId: 4,
    });
  });
});

describe("queueSong", () => {
  it("puts Play next at the front and Add to queue at the back", () => {
    const upNext = [item(8)];
    expect(
      queueSong(upNext, { songId: 9, position: "next" }).map((i) => i.songId),
    ).toEqual([9, 8]);
    expect(
      queueSong(upNext, { songId: 9, position: "last" }).map((i) => i.songId),
    ).toEqual([8, 9]);
  });

  it("gives every queued copy its own key, so a song can be queued twice", () => {
    const once = queueSong([], { songId: 9, position: "last" });
    const twice = queueSong(once, { songId: 9, position: "last" });
    expect(twice).toHaveLength(2);
    expect(twice[0].key).not.toBe(twice[1].key);
  });
});

describe("moveQueued", () => {
  const upNext = [item(7), item(8), item(9)];

  it("moves an item up or down", () => {
    expect(
      moveQueued(upNext, { key: "k9", offset: -1 }).map((i) => i.songId),
    ).toEqual([7, 9, 8]);
    expect(
      moveQueued(upNext, { key: "k7", offset: 1 }).map((i) => i.songId),
    ).toEqual([8, 7, 9]);
  });

  it("ignores moves past either end and unknown keys", () => {
    expect(moveQueued(upNext, { key: "k7", offset: -1 })).toBe(upNext);
    expect(moveQueued(upNext, { key: "k9", offset: 1 })).toBe(upNext);
    expect(moveQueued(upNext, { key: "nope", offset: 1 })).toBe(upNext);
  });
});

describe("removeSongEverywhere", () => {
  it("drops a deleted song from the list and the queue", () => {
    const state = { ...base, upNext: [item(3, "a"), item(9, "b")] };
    expect(removeSongEverywhere(state, 3)).toMatchObject({
      queue: [1, 2, 4],
      activeId: 2,
      contextId: 2,
      upNext: [item(9, "b")],
    });
  });

  it("moves on when the playing list song is deleted", () => {
    expect(removeSongEverywhere(base, 2)).toMatchObject({
      queue: [1, 3, 4],
      activeId: 3,
      contextId: 3,
    });
  });

  it("moves on when the playing queued song is deleted, instead of keeping it", () => {
    const state = { ...base, activeId: 9, upNext: [item(8)] };
    expect(removeSongEverywhere(state, 9)).toMatchObject({
      activeId: 8,
      contextId: 2,
      upNext: [],
    });
  });

  it("continues the list when the playing queued song was the last queued", () => {
    const state = { ...base, activeId: 9, upNext: [] };
    expect(removeSongEverywhere(state, 9)).toMatchObject({
      activeId: 3,
      contextId: 3,
    });
  });

  it("keeps the list position when its cursor song is deleted during a queued song", () => {
    // Queued 9 plays; the list cursor is 2. Deleting 2 must still resume
    // the list at 3, not skip to 4.
    const state = { ...base, activeId: 9 };
    const after = removeSongEverywhere(state, 2);
    expect(after).toMatchObject({ activeId: 9, contextId: 1 });
    expect(advance({ ...base, ...after }, { reason: "manual" })).toMatchObject({
      activeId: 3,
    });
  });
});

describe("upcomingFromList", () => {
  it("lists the songs after the cursor, wrapping with repeat all", () => {
    expect(upcomingFromList(base, { limit: 10 })).toEqual([3, 4, 1]);
  });

  it("stops at the end with repeat off", () => {
    expect(upcomingFromList({ ...base, repeat: "off" }, { limit: 10 })).toEqual(
      [3, 4],
    );
  });

  it("never lists the current song or more than the limit", () => {
    expect(upcomingFromList(base, { limit: 2 })).toEqual([3, 4]);
    expect(upcomingFromList(base, { limit: 10 })).not.toContain(2);
  });

  it("starts from the top when nothing from the list has played yet", () => {
    expect(
      upcomingFromList({ ...base, contextId: undefined }, { limit: 10 }),
    ).toEqual([1, 2, 3, 4]);
  });
});
