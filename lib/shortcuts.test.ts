import { describe, expect, it } from "vitest";
import { getShortcutAction } from "./shortcuts";

const press = (
  key: string,
  options: {
    shiftKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    altKey?: boolean;
    tagName?: string;
    role?: string;
    isContentEditable?: boolean;
  } = {},
) =>
  getShortcutAction({
    key,
    shiftKey: options.shiftKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    altKey: options.altKey ?? false,
    target: {
      tagName: options.tagName ?? "BODY",
      isContentEditable: options.isContentEditable ?? false,
      getAttribute: (name) => (name === "role" ? (options.role ?? null) : null),
    },
  });

describe("getShortcutAction", () => {
  it.each([
    [" ", "toggle-play"],
    ["k", "toggle-play"],
    ["K", "toggle-play"],
    ["ArrowRight", "seek-forward"],
    ["ArrowLeft", "seek-backward"],
    ["m", "toggle-mute"],
  ])("maps %j to %s", (key, action) => {
    expect(press(key)).toBe(action);
  });

  it("uses Shift+N and Shift+P for next and previous", () => {
    expect(press("N", { shiftKey: true })).toBe("next");
    expect(press("P", { shiftKey: true })).toBe("previous");
    expect(press("k", { shiftKey: true })).toBeNull();
  });

  it("ignores keys typed into fields", () => {
    expect(press(" ", { tagName: "INPUT" })).toBeNull();
    expect(press("k", { tagName: "TEXTAREA" })).toBeNull();
    expect(press("m", { isContentEditable: true })).toBeNull();
  });

  it("ignores keys pressed with Ctrl, Cmd or Alt", () => {
    expect(press("k", { ctrlKey: true })).toBeNull();
    expect(press("ArrowRight", { metaKey: true })).toBeNull();
    expect(press("m", { altKey: true })).toBeNull();
  });

  it("leaves Space to a focused button so it isn't toggled twice", () => {
    expect(press(" ", { tagName: "BUTTON" })).toBeNull();
    expect(press("k", { tagName: "BUTTON" })).toBe("toggle-play");
  });

  it("leaves arrows to a focused slider", () => {
    expect(press("ArrowRight", { tagName: "SPAN", role: "slider" })).toBeNull();
  });

  it("ignores unrelated keys", () => {
    expect(press("x")).toBeNull();
    expect(press("Enter")).toBeNull();
  });
});
