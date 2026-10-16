import { describe, expect, it } from "vitest";
import {
  ReportRow,
  groupReports,
  moderateSong,
  reasonLabel,
  reportSong,
} from "./moderation";
import { ISong } from "@/types";

type DbError = { code?: string; message: string } | null;

// Just enough of the Supabase client for the moderation helpers.
const fakeClient = (error: DbError = null) => {
  const inserted: unknown[] = [];
  const calls: unknown[] = [];
  const client = {
    from: (table: string) => ({
      insert: async (row: unknown) => {
        inserted.push({ table, row });
        return { error };
      },
    }),
    rpc: async (name: string, args: unknown) => {
      calls.push({ name, args });
      return { error };
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { client: client as any, inserted, calls };
};

const report = { songId: 7, reason: "copyright", details: "" };

describe("reportSong", () => {
  it("files the report with trimmed details", async () => {
    const { client, inserted } = fakeClient();
    await reportSong(client, { ...report, details: "  Not theirs  " });
    expect(inserted).toEqual([
      {
        table: "song_reports",
        row: { song_id: 7, reason: "copyright", details: "Not theirs" },
      },
    ]);
  });

  it("stores blank details as null", async () => {
    const { client, inserted } = fakeClient();
    await reportSong(client, { ...report, details: "   " });
    expect(inserted[0]).toMatchObject({ row: { details: null } });
  });

  it("rejects an unknown reason without asking the database", async () => {
    const { client, inserted } = fakeClient();
    await expect(
      reportSong(client, { ...report, reason: "boring" }),
    ).rejects.toThrow("Choose a reason");
    expect(inserted).toEqual([]);
  });

  it("rejects details over the limit", async () => {
    const { client, inserted } = fakeClient();
    await expect(
      reportSong(client, { ...report, details: "x".repeat(501) }),
    ).rejects.toThrow("under 500");
    expect(inserted).toEqual([]);
  });

  it("explains a second report of the same song", async () => {
    const { client } = fakeClient({ code: "23505", message: "duplicate" });
    await expect(reportSong(client, report)).rejects.toThrow(
      "You've already reported this song",
    );
  });

  it("explains a song that can't be reported", async () => {
    const { client } = fakeClient({ code: "42501", message: "rls" });
    await expect(reportSong(client, report)).rejects.toThrow(
      "This song can't be reported",
    );
  });

  it("passes other errors through", async () => {
    const { client } = fakeClient({ message: "offline" });
    await expect(reportSong(client, report)).rejects.toThrow("offline");
  });
});

describe("moderateSong", () => {
  it("calls moderate_song with the song and action", async () => {
    const { client, calls } = fakeClient();
    await moderateSong(client, { songId: 7, action: "hide" });
    expect(calls).toEqual([
      { name: "moderate_song", args: { target: 7, action: "hide" } },
    ]);
  });

  it("surfaces the database's refusal", async () => {
    const { client } = fakeClient({ message: "Only admins can moderate" });
    await expect(
      moderateSong(client, { songId: 7, action: "restore" }),
    ).rejects.toThrow("Only admins can moderate");
  });
});

const song = (id: number) => ({ id, title: `Song ${id}` }) as ISong;
const row = (
  songId: number,
  reason = "spam",
  at = "2026-10-01",
): ReportRow => ({
  song_id: songId,
  reason,
  details: null,
  created_at: at,
  songs: song(songId),
});

describe("groupReports", () => {
  it("groups reports by song, most reported first", () => {
    const grouped = groupReports([
      row(1, "spam", "2026-10-01"),
      row(2, "abuse", "2026-10-02"),
      row(2, "copyright", "2026-10-03"),
    ]);
    expect(grouped.map((entry) => entry.song.id)).toEqual([2, 1]);
    expect(grouped[0].reports.map((report) => report.reason)).toEqual([
      "abuse",
      "copyright",
    ]);
  });

  it("keeps first-reported order for equal counts", () => {
    const grouped = groupReports([row(3), row(1), row(2)]);
    expect(grouped.map((entry) => entry.song.id)).toEqual([3, 1, 2]);
  });

  it("skips reports whose song can't be read", () => {
    expect(groupReports([{ ...row(1), songs: null }])).toEqual([]);
  });
});

describe("reasonLabel", () => {
  it("names known reasons and passes others through", () => {
    expect(reasonLabel("copyright")).toBe("It's someone else's music");
    expect(reasonLabel("legacy")).toBe("legacy");
  });
});
