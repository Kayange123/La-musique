import { describe, expect, it } from "vitest";
import {
  TOUR_STEPS,
  TourStep,
  parseTourSeen,
  placeCard,
  stepsToShow,
  tourSeenKey,
} from "./tour";

const step = (id: string, extra: Partial<TourStep> = {}): TourStep => ({
  id,
  anchors: [],
  title: id,
  body: id,
  ...extra,
});

const ids = (steps: TourStep[]) => steps.map((s) => s.id);

describe("stepsToShow", () => {
  const steps = [
    step("welcome"),
    step("nav", { anchors: ["nav", "mobile-nav"] }),
    step("upload", { anchors: ["upload"] }),
    step("keys", { finePointerOnly: true }),
  ];

  it("keeps steps whose anchor is on screen", () => {
    const shown = stepsToShow(steps, {
      hasAnchor: (name) => ["nav", "upload"].includes(name),
      finePointer: true,
    });
    expect(ids(shown)).toEqual(["welcome", "nav", "upload", "keys"]);
  });

  it("uses any of a step's anchors, so phones get the tab bar", () => {
    const shown = stepsToShow(steps, {
      hasAnchor: (name) => name === "mobile-nav",
      finePointer: false,
    });
    expect(ids(shown)).toEqual(["welcome", "nav"]);
  });

  it("leaves keyboard tips out on touch screens", () => {
    const shown = stepsToShow([step("keys", { finePointerOnly: true })], {
      hasAnchor: () => false,
      finePointer: false,
    });
    expect(shown).toEqual([]);
  });

  it("gives every real step a phone or desktop anchor", () => {
    const desktop = ["nav", "playlists", "upload", "new-songs", "account"];
    const shown = stepsToShow(TOUR_STEPS, {
      hasAnchor: (name) => desktop.includes(name),
      finePointer: true,
    });
    expect(shown).toHaveLength(TOUR_STEPS.length);
  });
});

describe("placeCard", () => {
  const viewport = { width: 1000, height: 800 };
  const card = { width: 300, height: 200 };

  it("goes below the target when there's room", () => {
    const target = { top: 100, left: 100, width: 200, height: 40 };
    expect(placeCard({ target, card, viewport })).toEqual({
      top: 152,
      left: 100,
    });
  });

  it("goes above a target near the bottom", () => {
    const target = { top: 700, left: 100, width: 200, height: 40 };
    expect(placeCard({ target, card, viewport })).toEqual({
      top: 488,
      left: 100,
    });
  });

  it("goes beside a target as tall as the screen", () => {
    const target = { top: 16, left: 8, width: 300, height: 770 };
    expect(placeCard({ target, card, viewport })).toEqual({
      top: 16,
      left: 320,
    });
  });

  it("stays on screen when nothing fits", () => {
    const target = { top: 0, left: 900, width: 100, height: 800 };
    const spot = placeCard({
      target,
      card,
      viewport: { width: 400, height: 300 },
    });
    expect(spot).toEqual({ top: 84, left: 84 });
  });
});

describe("tour seen flag", () => {
  it("is per account", () => {
    expect(tourSeenKey("a")).not.toBe(tourSeenKey("b"));
  });

  it("counts any stored value as seen", () => {
    expect(parseTourSeen(null)).toBe(false);
    expect(parseTourSeen("1")).toBe(true);
  });
});
