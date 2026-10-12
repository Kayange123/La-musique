import { describe, expect, it, vi } from "vitest";
import { deleteOwnSong } from "./songs";

type Row = { song_path: string | null; image_path: string | null };

// Just enough of the Supabase client for deleteOwnSong.
const fakeClient = ({
  rows = [],
  deleteError = null,
  removeError = null,
}: {
  rows?: Row[];
  deleteError?: { message: string } | null;
  removeError?: { message: string } | null;
}) => {
  const removed: string[] = [];
  const client = {
    from: () => ({
      delete: () => ({
        eq: () => ({
          select: async () => ({ data: rows, error: deleteError }),
        }),
      }),
    }),
    storage: {
      from: (bucket: string) => ({
        remove: async (paths: string[]) => {
          removed.push(...paths.map((path) => `${bucket}/${path}`));
          return { error: removeError };
        },
      }),
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: client as any, removed };
};

describe("deleteOwnSong", () => {
  it("removes the song and cover files after deleting the row", async () => {
    const { client, removed } = fakeClient({
      rows: [{ song_path: "song-a.mp3", image_path: "image-a" }],
    });
    await deleteOwnSong(client, 1);
    expect(removed.sort()).toEqual(["images/image-a", "songs/song-a.mp3"]);
  });

  it("touches no files when RLS matched nothing (not the owner)", async () => {
    const { client, removed } = fakeClient({ rows: [] });
    await expect(deleteOwnSong(client, 1)).rejects.toThrow(
      "Couldn't delete this song",
    );
    expect(removed).toEqual([]);
  });

  it("touches no files when the delete fails", async () => {
    const { client, removed } = fakeClient({
      deleteError: { message: "network down" },
    });
    await expect(deleteOwnSong(client, 1)).rejects.toThrow("network down");
    expect(removed).toEqual([]);
  });

  it("still succeeds when a file can't be removed", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeClient({
      rows: [{ song_path: "song-a.mp3", image_path: "image-a" }],
      removeError: { message: "storage down" },
    });
    await expect(deleteOwnSong(client, 1)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(2);
    error.mockRestore();
  });

  it("skips missing paths", async () => {
    const { client, removed } = fakeClient({
      rows: [{ song_path: "song-a.mp3", image_path: null }],
    });
    await deleteOwnSong(client, 1);
    expect(removed).toEqual(["songs/song-a.mp3"]);
  });
});
