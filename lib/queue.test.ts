import { describe, expect, it } from "vitest";
import { getNextId, getPreviousId } from "./queue";

const ids = [3, 2, 1];

describe("getNextId", () => {
  it("moves to the next song in the middle of the queue", () => {
    expect(getNextId(ids, 2)).toBe(1);
  });

  it("wraps to the first song at the end", () => {
    expect(getNextId(ids, 1)).toBe(3);
  });

  it("starts from the first song when the active song isn't queued", () => {
    expect(getNextId(ids, 99)).toBe(3);
    expect(getNextId(ids, undefined)).toBe(3);
  });

  it("returns undefined for an empty queue", () => {
    expect(getNextId([], 1)).toBeUndefined();
  });
});

describe("getPreviousId", () => {
  it("moves to the previous song in the middle of the queue", () => {
    expect(getPreviousId(ids, 2)).toBe(3);
  });

  it("wraps to the last song at the start", () => {
    expect(getPreviousId(ids, 3)).toBe(1);
  });

  it("starts from the last song when the active song isn't queued", () => {
    expect(getPreviousId(ids, 99)).toBe(1);
  });

  it("returns undefined for an empty queue", () => {
    expect(getPreviousId([], 1)).toBeUndefined();
  });

  it("stays on the only song in a single-song queue", () => {
    expect(getNextId([7], 7)).toBe(7);
    expect(getPreviousId([7], 7)).toBe(7);
  });
});
