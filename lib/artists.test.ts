import { describe, expect, it } from "vitest";
import {
  cleanBio,
  cleanDisplayName,
  cleanHandle,
  getProfilesByUserIds,
  parseHandle,
  saveArtistProfile,
} from "./artists";

describe("cleanHandle", () => {
  it("lowercases and drops a leading @", () => {
    expect(cleanHandle("  @Alice_Sings ")).toBe("alice_sings");
  });

  it.each(["ab", "has space", "émile", "a".repeat(31), "dash-ed", ""])(
    "rejects %j",
    (handle) => {
      expect(() => cleanHandle(handle)).toThrow("3-30 letters");
    },
  );
});

describe("parseHandle", () => {
  it("accepts valid handles from the URL, in any case", () => {
    expect(parseHandle("alice_sings")).toBe("alice_sings");
    expect(parseHandle("Alice_Sings")).toBe("alice_sings");
  });

  it("returns null for anything else", () => {
    expect(parseHandle("ab")).toBeNull();
    expect(parseHandle("..%2Fadmin")).toBeNull();
    expect(parseHandle("a%20b")).toBeNull();
    expect(parseHandle("%E0%A4%A")).toBeNull();
  });
});

describe("cleanDisplayName and cleanBio", () => {
  it("trims and enforces limits", () => {
    expect(cleanDisplayName("  Alice ")).toBe("Alice");
    expect(() => cleanDisplayName("   ")).toThrow("Add a display name");
    expect(() => cleanDisplayName("a".repeat(61))).toThrow("under 60");
    expect(cleanBio("  ")).toBeNull();
    expect(() => cleanBio("a".repeat(501))).toThrow("under 500");
  });
});

// A fake client that records the upsert and returns the given error.
const upsertClient = (error: { message: string; code?: string } | null) => {
  const calls: { row?: unknown; options?: unknown } = {};
  const client = {
    from: () => ({
      upsert: async (row: unknown, options: unknown) => {
        calls.row = row;
        calls.options = options;
        return { error };
      },
    }),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: client as any, calls };
};

describe("saveArtistProfile", () => {
  const profile = {
    userId: "u1",
    handle: "@Alice",
    displayName: " Alice ",
    bio: "",
  };

  it("saves the cleaned profile against the user's own row", async () => {
    const { client, calls } = upsertClient(null);
    await saveArtistProfile(client, profile);
    expect(calls.row).toEqual({
      user_id: "u1",
      handle: "alice",
      display_name: "Alice",
      bio: null,
    });
    expect(calls.options).toEqual({ onConflict: "user_id" });
  });

  it("explains a taken handle", async () => {
    const { client } = upsertClient({ message: "duplicate", code: "23505" });
    await expect(saveArtistProfile(client, profile)).rejects.toThrow(
      "That handle is taken",
    );
  });

  it("doesn't call the database for an invalid handle", async () => {
    const { client, calls } = upsertClient(null);
    await expect(
      saveArtistProfile(client, { ...profile, handle: "no spaces allowed" }),
    ).rejects.toThrow();
    expect(calls.row).toBeUndefined();
  });
});

describe("getProfilesByUserIds", () => {
  it("queries each uploader once and keys profiles by user id", async () => {
    let queried: unknown;
    const client = {
      from: () => ({
        select: () => ({
          in: async (_column: string, ids: string[]) => {
            queried = ids;
            return { data: [{ user_id: "u1", handle: "alice" }] };
          },
        }),
      }),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = await getProfilesByUserIds(client as any, [
      "u1",
      "u2",
      "u1",
      null,
    ]);
    expect(queried).toEqual(["u1", "u2"]);
    expect(map.get("u1")?.handle).toBe("alice");
    expect(map.has("u2")).toBe(false);
  });

  it("skips the query when there are no uploaders", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = await getProfilesByUserIds({} as any, [null]);
    expect(map.size).toBe(0);
  });
});
