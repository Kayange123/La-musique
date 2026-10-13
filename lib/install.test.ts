import { describe, expect, it } from "vitest";
import {
  getInstallMethod,
  parseDismissedAt,
  shouldOfferInstall,
} from "./install";

const ua = {
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0 Mobile/15E148 Safari/604.1",
  ipadSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  android:
    "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
};

describe("getInstallMethod", () => {
  it("uses the browser prompt when one is available", () => {
    expect(
      getInstallMethod({
        userAgent: ua.android,
        hasPromptEvent: true,
        maxTouchPoints: 5,
      }),
    ).toBe("prompt");
  });

  it("shows instructions in Safari on iPhone and iPad", () => {
    expect(
      getInstallMethod({
        userAgent: ua.iphoneSafari,
        hasPromptEvent: false,
        maxTouchPoints: 5,
      }),
    ).toBe("ios");
    expect(
      getInstallMethod({
        userAgent: ua.ipadSafari,
        hasPromptEvent: false,
        maxTouchPoints: 5,
      }),
    ).toBe("ios");
  });

  it("offers nothing where installing isn't possible", () => {
    // Chrome on iPhone can't install web apps.
    expect(
      getInstallMethod({
        userAgent: ua.iphoneChrome,
        hasPromptEvent: false,
        maxTouchPoints: 5,
      }),
    ).toBeNull();
    // A Mac with Safari (no touch screen) uses Safari's own menu.
    expect(
      getInstallMethod({
        userAgent: ua.ipadSafari,
        hasPromptEvent: false,
        maxTouchPoints: 0,
      }),
    ).toBeNull();
    // Android before the browser decides the app is installable.
    expect(
      getInstallMethod({
        userAgent: ua.android,
        hasPromptEvent: false,
        maxTouchPoints: 5,
      }),
    ).toBeNull();
  });
});

describe("shouldOfferInstall", () => {
  const now = 1_800_000_000_000;
  const day = 24 * 60 * 60 * 1000;
  const base = {
    method: "prompt" as const,
    isInstalled: false,
    dismissedAt: null,
    now,
  };

  it("offers when installable, not installed and not dismissed", () => {
    expect(shouldOfferInstall(base)).toBe(true);
  });

  it("doesn't offer once installed, or with no way to install", () => {
    expect(shouldOfferInstall({ ...base, isInstalled: true })).toBe(false);
    expect(shouldOfferInstall({ ...base, method: null })).toBe(false);
  });

  it("stays quiet for 30 days after Not now", () => {
    expect(shouldOfferInstall({ ...base, dismissedAt: now - 5 * day })).toBe(
      false,
    );
    expect(shouldOfferInstall({ ...base, dismissedAt: now - 31 * day })).toBe(
      true,
    );
  });
});

describe("parseDismissedAt", () => {
  it("reads a stored time and ignores anything else", () => {
    expect(parseDismissedAt("1800000000000")).toBe(1_800_000_000_000);
    expect(parseDismissedAt(null)).toBeNull();
    expect(parseDismissedAt("")).toBeNull();
    expect(parseDismissedAt("soon")).toBeNull();
    expect(parseDismissedAt("-5")).toBeNull();
  });
});
