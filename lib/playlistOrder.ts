import { ISong } from "@/types";

// A song as it sits in a playlist.
export interface PlaylistEntry {
  song: ISong;
  position: number;
  addedAt: string;
}

export type PlaylistSort = "custom" | "title" | "artist" | "added";

export const SORT_LABELS: Record<PlaylistSort, string> = {
  custom: "Custom order",
  title: "Title",
  artist: "Artist",
  added: "Date added",
};

// A position strictly between two neighbours; either side may be missing
// (moving to the top or the bottom).
export const positionBetween = (neighbours: {
  before?: number;
  after?: number;
}): number => {
  const { before, after } = neighbours;
  if (before !== undefined && after !== undefined) {
    return (before + after) / 2;
  }
  if (after !== undefined) {
    return after - 1;
  }
  return (before ?? 0) + 1;
};

const isIndexIn = (list: unknown[], index: number) =>
  index >= 0 && index < list.length;

// The new position for moving one song up (-1) or down (+1) in an
// ordered list, or null when it's already at that end.
export const positionForMove = (
  entries: PlaylistEntry[],
  move: { songId: number; offset: -1 | 1 },
): number | null => {
  const from = entries.findIndex((entry) => entry.song.id === move.songId);
  const to = from + move.offset;
  if (from === -1 || !isIndexIn(entries, to)) {
    return null;
  }
  // Moving up lands between the entry above the target and the target;
  // moving down lands between the target and the entry below it.
  const neighbours =
    move.offset === -1
      ? { before: entries[to - 1]?.position, after: entries[to].position }
      : { before: entries[to].position, after: entries[to + 1]?.position };
  return positionBetween(neighbours);
};

const byText = (value: (entry: PlaylistEntry) => string | null) => {
  return (a: PlaylistEntry, b: PlaylistEntry) =>
    (value(a) ?? "").localeCompare(value(b) ?? "", undefined, {
      sensitivity: "base",
    });
};

const COMPARATORS: Record<
  PlaylistSort,
  (a: PlaylistEntry, b: PlaylistEntry) => number
> = {
  custom: (a, b) => a.position - b.position,
  title: byText((entry) => entry.song.title),
  artist: byText((entry) => entry.song.author),
  // Newest first, like most music apps.
  added: (a, b) => b.addedAt.localeCompare(a.addedAt),
};

export const sortEntries = (
  entries: PlaylistEntry[],
  sort: PlaylistSort,
): PlaylistEntry[] => [...entries].sort(COMPARATORS[sort]);
