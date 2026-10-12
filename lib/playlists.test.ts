import { describe, expect, it } from "vitest";
import {
  addSongToPlaylist,
  cleanPlaylistName,
  createPlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
  renamePlaylist,
} from "./playlists";

type Result = {
  data?: unknown;
  error?: { message: string; code?: string } | null;
};

// A fake query builder: every chained call returns itself, and awaiting it
// (directly, or through .single()) yields the given result. It records the
// last write so tests can check what was sent.
const fakeClient = (result: Result) => {
  const calls: { table?: string; payload?: unknown; filters: unknown[] } = {
    filters: [],
  };
  const settled = { data: result.data ?? null, error: result.error ?? null };
  const builder: Record<string, unknown> = {
    then: (resolve: (value: typeof settled) => unknown) => resolve(settled),
    single: async () => settled,
  };
  for (const method of ["select", "delete"]) {
    builder[method] = () => builder;
  }
  for (const method of ["insert", "update"]) {
    builder[method] = (payload: unknown) => {
      calls.payload = payload;
      return builder;
    };
  }
  builder.eq = (column: string, value: unknown) => {
    calls.filters.push([column, value]);
    return builder;
  };
  const client = {
    from: (table: string) => {
      calls.table = table;
      return builder;
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: client as any, calls };
};

describe("cleanPlaylistName", () => {
  it("trims the name", () => {
    expect(cleanPlaylistName("  Road trip  ")).toBe("Road trip");
  });

  it("rejects blank names", () => {
    expect(() => cleanPlaylistName("   ")).toThrow("Give the playlist a name");
  });

  it("rejects names over 100 characters", () => {
    expect(() => cleanPlaylistName("a".repeat(101))).toThrow("under 100");
    expect(cleanPlaylistName("a".repeat(100))).toHaveLength(100);
  });
});

describe("createPlaylist", () => {
  it("inserts the trimmed name and returns the new id", async () => {
    const { client, calls } = fakeClient({ data: { id: 7 } });
    await expect(createPlaylist(client, " Chill ")).resolves.toBe(7);
    expect(calls.table).toBe("playlists");
    expect(calls.payload).toEqual({ name: "Chill" });
  });

  it("doesn't call the database for a blank name", async () => {
    const { client, calls } = fakeClient({ data: { id: 7 } });
    await expect(createPlaylist(client, "")).rejects.toThrow();
    expect(calls.payload).toBeUndefined();
  });
});

describe("renamePlaylist and deletePlaylist", () => {
  it("succeed when RLS matched the row", async () => {
    const { client, calls } = fakeClient({ data: [{ id: 3 }] });
    await renamePlaylist(client, 3, "New name");
    expect(calls.filters).toEqual([["id", 3]]);
    await expect(
      deletePlaylist(fakeClient({ data: [{ id: 3 }] }).client, 3),
    ).resolves.toBeUndefined();
  });

  it("fail when RLS matched nothing (someone else's playlist)", async () => {
    await expect(
      renamePlaylist(fakeClient({ data: [] }).client, 3, "x"),
    ).rejects.toThrow("Couldn't rename this playlist");
    await expect(
      deletePlaylist(fakeClient({ data: [] }).client, 3),
    ).rejects.toThrow("Couldn't delete this playlist");
  });

  it("pass database errors through", async () => {
    await expect(
      deletePlaylist(
        fakeClient({ error: { message: "network down" } }).client,
        3,
      ),
    ).rejects.toThrow("network down");
  });
});

describe("addSongToPlaylist", () => {
  it("inserts the playlist and song ids", async () => {
    const { client, calls } = fakeClient({});
    await addSongToPlaylist(client, 2, 9);
    expect(calls.table).toBe("playlist_songs");
    expect(calls.payload).toEqual({ playlist_id: 2, song_id: 9 });
  });

  it("explains a duplicate instead of showing the raw error", async () => {
    const { client } = fakeClient({
      error: { message: "duplicate key value", code: "23505" },
    });
    await expect(addSongToPlaylist(client, 2, 9)).rejects.toThrow(
      "Already in this playlist",
    );
  });

  it("passes other errors through, e.g. RLS refusing another user's playlist", async () => {
    const { client } = fakeClient({
      error: { message: "new row violates row-level security", code: "42501" },
    });
    await expect(addSongToPlaylist(client, 2, 9)).rejects.toThrow(
      "row-level security",
    );
  });
});

describe("removeSongFromPlaylist", () => {
  it("filters by both playlist and song", async () => {
    const { client, calls } = fakeClient({ data: [{ song_id: 9 }] });
    await removeSongFromPlaylist(client, 2, 9);
    expect(calls.filters).toEqual([
      ["playlist_id", 2],
      ["song_id", 9],
    ]);
  });

  it("fails when nothing was removed", async () => {
    await expect(
      removeSongFromPlaylist(fakeClient({ data: [] }).client, 2, 9),
    ).rejects.toThrow("Couldn't remove this song");
  });
});
