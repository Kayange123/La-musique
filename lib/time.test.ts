import { describe, expect, it } from "vitest";
import { formatTime } from "./time";

describe("formatTime", () => {
  it.each([
    [0, "0:00"],
    [5, "0:05"],
    [65.9, "1:05"],
    [600, "10:00"],
    [3725, "62:05"],
  ])("formats %s seconds as %s", (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected);
  });

  it("treats invalid input as zero", () => {
    expect(formatTime(NaN)).toBe("0:00");
    expect(formatTime(-3)).toBe("0:00");
    expect(formatTime(Infinity)).toBe("0:00");
  });
});
