import { describe, expect, it } from "vitest";
import {
  addSongToPlaylist,
  cleanPlaylistName,
  createPlaylist,
  deletePlaylist,
  listPlaylists,
  parsePlaylistId,
  removeSongFromPlaylist,
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
  for (const method of ["select", "delete", "order"]) {
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
    await expect(createPlaylist(client, { name: " Chill " })).resolves.toBe(7);
    expect(calls.table).toBe("playlists");
    expect(calls.payload).toEqual({ name: "Chill" });
  });

  it("doesn't call the database for a blank name", async () => {
    const { client, calls } = fakeClient({ data: { id: 7 } });
    await expect(createPlaylist(client, { name: "" })).rejects.toThrow();
    expect(calls.payload).toBeUndefined();
  });
});

describe("deletePlaylist", () => {
  it("succeeds when RLS matched the row", async () => {
    const { client, calls } = fakeClient({ data: [{ id: 3 }] });
    await expect(deletePlaylist(client, { id: 3 })).resolves.toBeUndefined();
    expect(calls.filters).toEqual([["id", 3]]);
  });

  it("fails when RLS matched nothing (someone else's playlist)", async () => {
    await expect(
      deletePlaylist(fakeClient({ data: [] }).client, { id: 3 }),
    ).rejects.toThrow("Couldn't delete this playlist");
  });

  it("passes database errors through", async () => {
    await expect(
      deletePlaylist(
        fakeClient({ error: { message: "network down" } }).client,
        { id: 3 },
      ),
    ).rejects.toThrow("network down");
  });
});

describe("addSongToPlaylist", () => {
  it("inserts the playlist and song ids", async () => {
    const { client, calls } = fakeClient({});
    await addSongToPlaylist(client, { playlistId: 2, songId: 9 });
    expect(calls.table).toBe("playlist_songs");
    expect(calls.payload).toEqual({ playlist_id: 2, song_id: 9 });
  });

  it("explains a duplicate instead of showing the raw error", async () => {
    const { client } = fakeClient({
      error: { message: "duplicate key value", code: "23505" },
    });
    await expect(
      addSongToPlaylist(client, { playlistId: 2, songId: 9 }),
    ).rejects.toThrow("Already in this playlist");
  });

  it("passes other errors through, e.g. RLS refusing another user's playlist", async () => {
    const { client } = fakeClient({
      error: { message: "new row violates row-level security", code: "42501" },
    });
    await expect(
      addSongToPlaylist(client, { playlistId: 2, songId: 9 }),
    ).rejects.toThrow("row-level security");
  });
});

describe("removeSongFromPlaylist", () => {
  it("filters by both playlist and song", async () => {
    const { client, calls } = fakeClient({ data: [{ song_id: 9 }] });
    await removeSongFromPlaylist(client, { playlistId: 2, songId: 9 });
    expect(calls.filters).toEqual([
      ["playlist_id", 2],
      ["song_id", 9],
    ]);
  });

  it("fails when nothing was removed", async () => {
    await expect(
      removeSongFromPlaylist(fakeClient({ data: [] }).client, {
        playlistId: 2,
        songId: 9,
      }),
    ).rejects.toThrow("Couldn't remove this song");
  });
});

describe("parsePlaylistId", () => {
  it("accepts positive whole numbers", () => {
    expect(parsePlaylistId("1")).toBe(1);
    expect(parsePlaylistId("42")).toBe(42);
  });

  it.each(["0", "-1", "1.5", "abc", "", "1e3", " 7", "007"])(
    "rejects %j",
    (value) => {
      expect(parsePlaylistId(value)).toBeNull();
    },
  );
});

describe("listPlaylists", () => {
  it("returns the user's playlists", async () => {
    const rows = [{ id: 1, name: "A" }];
    const { client, calls } = fakeClient({ data: rows });
    await expect(listPlaylists(client, { id: "user-1" })).resolves.toEqual(
      rows,
    );
    expect(calls.filters).toEqual([["user_id", "user-1"]]);
  });

  it("passes errors through", async () => {
    const { client } = fakeClient({ error: { message: "network down" } });
    await expect(listPlaylists(client, { id: "user-1" })).rejects.toThrow(
      "network down",
    );
  });
});
