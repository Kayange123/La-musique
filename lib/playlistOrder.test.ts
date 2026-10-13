import { describe, expect, it } from "vitest";
import { ISong } from "@/types";
import {
  PlaylistEntry,
  positionBetween,
  positionForMove,
  sortEntries,
} from "./playlistOrder";

const entry = (
  id: number,
  position: number,
  extra: { title?: string; author?: string; addedAt?: string } = {},
): PlaylistEntry => ({
  song: {
    id,
    title: extra.title ?? `Song ${id}`,
    author: extra.author ?? "Artist",
  } as ISong,
  position,
  addedAt: extra.addedAt ?? "2026-10-01T00:00:00Z",
});

describe("positionBetween", () => {
  it("takes the midpoint between two neighbours", () => {
    expect(positionBetween({ before: 1, after: 2 })).toBe(1.5);
  });

  it("goes above the first song or below the last", () => {
    expect(positionBetween({ after: 1 })).toBe(0);
    expect(positionBetween({ before: 3 })).toBe(4);
  });

  it("starts at 1 in an empty list", () => {
    expect(positionBetween({})).toBe(1);
  });
});

describe("positionForMove", () => {
  const list = [entry(10, 1), entry(20, 2), entry(30, 3), entry(40, 4)];

  const orderAfter = (songId: number, offset: -1 | 1) => {
    const position = positionForMove(list, { songId, offset });
    return sortEntries(
      list.map((e) =>
        e.song.id === songId ? { ...e, position: position! } : e,
      ),
      "custom",
    ).map((e) => e.song.id);
  };

  it("moves a song up one place", () => {
    expect(orderAfter(30, -1)).toEqual([10, 30, 20, 40]);
  });

  it("moves a song down one place", () => {
    expect(orderAfter(20, 1)).toEqual([10, 30, 20, 40]);
  });

  it("moves to the very top and the very bottom", () => {
    expect(orderAfter(20, -1)).toEqual([20, 10, 30, 40]);
    expect(orderAfter(30, 1)).toEqual([10, 20, 40, 30]);
  });

  it("returns null when the song is already at that end, or not listed", () => {
    expect(positionForMove(list, { songId: 10, offset: -1 })).toBeNull();
    expect(positionForMove(list, { songId: 40, offset: 1 })).toBeNull();
    expect(positionForMove(list, { songId: 99, offset: 1 })).toBeNull();
  });

  it("keeps working after many moves between the same neighbours", () => {
    let entries = [entry(1, 1), entry(2, 2), entry(3, 3)];
    for (let i = 0; i < 40; i++) {
      // Repeatedly move whatever is last up one place.
      const last = sortEntries(entries, "custom").at(-1)!;
      const position = positionForMove(sortEntries(entries, "custom"), {
        songId: last.song.id,
        offset: -1,
      })!;
      entries = entries.map((e) =>
        e.song.id === last.song.id ? { ...e, position } : e,
      );
    }
    const positions = sortEntries(entries, "custom").map((e) => e.position);
    expect(new Set(positions).size).toBe(3);
  });
});

describe("sortEntries", () => {
  const list = [
    entry(1, 2, { title: "beta", author: "Zed", addedAt: "2026-10-02" }),
    entry(2, 1, { title: "Alpha", author: "amani", addedAt: "2026-10-03" }),
    entry(3, 3, { title: "Café", author: "Bea", addedAt: "2026-10-01" }),
  ];
  const ids = (sort: Parameters<typeof sortEntries>[1]) =>
    sortEntries(list, sort).map((e) => e.song.id);

  it("orders by custom position", () => {
    expect(ids("custom")).toEqual([2, 1, 3]);
  });

  it("orders by title and artist, ignoring case", () => {
    expect(ids("title")).toEqual([2, 1, 3]);
    expect(ids("artist")).toEqual([2, 3, 1]);
  });

  it("orders by date added, newest first", () => {
    expect(ids("added")).toEqual([2, 1, 3]);
  });

  it("doesn't change the list it was given", () => {
    sortEntries(list, "title");
    expect(list.map((e) => e.song.id)).toEqual([1, 2, 3]);
  });
});
