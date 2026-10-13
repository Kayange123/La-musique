import { describe, expect, it, vi } from "vitest";
import {
  cleanDescription,
  removePlaylistCover,
  setPlaylistCover,
  setSongPosition,
  updatePlaylistDetails,
} from "./playlistDetails";
import { deletePlaylist } from "./playlists";

type Result = { data?: unknown; error?: { message: string } | null };

// A fake Supabase client: table queries resolve to `rows` (an empty list
// means RLS matched nothing), and storage calls are recorded in order.
const fakeClient = (
  options: { rows?: unknown[]; uploadError?: string } = {},
) => {
  const log: string[] = [];
  const writes: { payload?: unknown; filters: unknown[] } = { filters: [] };
  const result: Result = { data: options.rows ?? [{ id: 1 }], error: null };
  const builder: Record<string, unknown> = {
    then: (resolve: (value: Result) => unknown) => resolve(result),
  };
  for (const method of ["select", "delete"]) {
    builder[method] = () => builder;
  }
  builder.update = (payload: unknown) => {
    writes.payload = payload;
    log.push("update");
    return builder;
  };
  builder.eq = (column: string, value: unknown) => {
    writes.filters.push([column, value]);
    return builder;
  };
  const client = {
    from: () => builder,
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string) => {
          log.push(`upload ${bucket}/${path.replace(/-[a-z0-9]+\./, "-ID.")}`);
          return {
            error: options.uploadError
              ? { message: options.uploadError }
              : null,
          };
        },
        remove: async (paths: string[]) => {
          log.push(
            `remove ${bucket}/${paths.join(",").replace(/-[a-z0-9]+\./, "-ID.")}`,
          );
          return { error: null };
        },
      }),
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: client as any, log, writes };
};

const image = (type = "image/png", size = 1024) =>
  ({ name: "cover", type, size }) as File;

describe("cleanDescription", () => {
  it("trims and treats blank as no description", () => {
    expect(cleanDescription("  Long drives  ")).toBe("Long drives");
    expect(cleanDescription("   ")).toBeNull();
  });

  it("rejects descriptions over 300 characters", () => {
    expect(() => cleanDescription("a".repeat(301))).toThrow("under 300");
    expect(cleanDescription("a".repeat(300))).toHaveLength(300);
  });
});

describe("updatePlaylistDetails", () => {
  it("saves the cleaned name and description", async () => {
    const { client, writes } = fakeClient();
    await updatePlaylistDetails(client, {
      id: 5,
      name: "  Road trip ",
      description: "  ",
    });
    expect(writes.payload).toEqual({ name: "Road trip", description: null });
    expect(writes.filters).toEqual([["id", 5]]);
  });

  it("fails when RLS matched nothing", async () => {
    const { client } = fakeClient({ rows: [] });
    await expect(
      updatePlaylistDetails(client, { id: 5, name: "x", description: "" }),
    ).rejects.toThrow("Couldn't save this playlist");
  });
});

describe("setSongPosition", () => {
  it("updates only the position, for that playlist and song", async () => {
    const { client, writes } = fakeClient();
    await setSongPosition(client, { playlistId: 2, songId: 9, position: 1.5 });
    expect(writes.payload).toEqual({ position: 1.5 });
    expect(writes.filters).toEqual([
      ["playlist_id", 2],
      ["song_id", 9],
    ]);
  });
});

describe("setPlaylistCover", () => {
  const playlist = { id: 5, cover_path: "oldcover.png" };

  it("uploads, points the playlist at the new cover, then removes the old one", async () => {
    const { client, log } = fakeClient();
    await setPlaylistCover(client, { playlist, file: image() });
    expect(log).toEqual([
      "upload images/playlist-5-ID.png",
      "update",
      "remove images/oldcover.png",
    ]);
  });

  it("rejects SVG and other files without uploading anything", async () => {
    const { client, log } = fakeClient();
    await expect(
      setPlaylistCover(client, { playlist, file: image("image/svg+xml") }),
    ).rejects.toThrow("JPEG, PNG, WebP or GIF");
    expect(log).toEqual([]);
  });

  it("removes the new file and keeps the old cover if the playlist isn't theirs", async () => {
    const { client, log } = fakeClient({ rows: [] });
    await expect(
      setPlaylistCover(client, { playlist, file: image() }),
    ).rejects.toThrow();
    expect(log).toEqual([
      "upload images/playlist-5-ID.png",
      "update",
      "remove images/playlist-5-ID.png",
    ]);
  });

  it("stops if the upload fails", async () => {
    const { client, log } = fakeClient({ uploadError: "storage down" });
    await expect(
      setPlaylistCover(client, { playlist, file: image() }),
    ).rejects.toThrow("storage down");
    expect(log).toEqual(["upload images/playlist-5-ID.png"]);
  });
});

describe("removePlaylistCover", () => {
  it("clears the cover, then removes the file", async () => {
    const { client, log, writes } = fakeClient();
    await removePlaylistCover(client, {
      id: 5,
      cover_path: "oldcover.png",
    });
    expect(writes.payload).toEqual({ cover_path: null });
    expect(log).toEqual(["update", "remove images/oldcover.png"]);
  });
});

describe("deletePlaylist", () => {
  it("removes the cover file after deleting the playlist", async () => {
    const { client, log } = fakeClient();
    await deletePlaylist(client, { id: 5, cover_path: "oldcover.png" });
    expect(log).toEqual(["remove images/oldcover.png"]);
  });

  it("leaves storage alone when the playlist has no cover", async () => {
    const { client, log } = fakeClient();
    await deletePlaylist(client, { id: 5, cover_path: null });
    expect(log).toEqual([]);
  });

  it("doesn't touch the cover when the delete matched nothing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { client, log } = fakeClient({ rows: [] });
    await expect(
      deletePlaylist(client, { id: 5, cover_path: "oldcover.png" }),
    ).rejects.toThrow();
    expect(log).toEqual([]);
    error.mockRestore();
  });
});
