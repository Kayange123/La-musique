import { describe, expect, it } from "vitest";
import { parseResumePoint, toResumePoint } from "./resume";

const now = 1_800_000_000_000;
const day = 24 * 60 * 60 * 1000;

describe("toResumePoint", () => {
  it("saves the song and whole-second position", () => {
    expect(
      toResumePoint({ songId: 4, position: 72.6, duration: 214, now }),
    ).toEqual({ songId: 4, position: 72, savedAt: now });
  });

  it("doesn't save right at the start or the end", () => {
    expect(
      toResumePoint({ songId: 4, position: 2, duration: 214, now }),
    ).toBeNull();
    expect(
      toResumePoint({ songId: 4, position: 212, duration: 214, now }),
    ).toBeNull();
  });
});

describe("parseResumePoint", () => {
  const valid = JSON.stringify({ songId: 4, position: 72, savedAt: now - day });

  it("reads a saved point", () => {
    expect(parseResumePoint(valid, { now })).toEqual({
      songId: 4,
      position: 72,
      savedAt: now - day,
    });
  });

  it("ignores points older than 30 days", () => {
    const old = JSON.stringify({
      songId: 4,
      position: 72,
      savedAt: now - 31 * day,
    });
    expect(parseResumePoint(old, { now })).toBeNull();
  });

  it.each([
    null,
    "",
    "not json",
    "null",
    "[]",
    JSON.stringify({ songId: "4", position: 72, savedAt: now }),
    JSON.stringify({ songId: 4, position: -1, savedAt: now }),
    JSON.stringify({ songId: 4, savedAt: now }),
  ])("ignores malformed value %j", (raw) => {
    expect(parseResumePoint(raw, { now })).toBeNull();
  });
});
