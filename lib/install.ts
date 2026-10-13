// When to offer "Add La-musique to your home screen".

export const INSTALL_DISMISSED_KEY = "la-musique:install-dismissed";
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

export type InstallMethod = "prompt" | "ios" | null;

type Device = {
  userAgent: string;
  hasPromptEvent: boolean;
  maxTouchPoints: number;
};

// iPadOS reports itself as a Mac, but has a touch screen.
const isIpadAsMac = (device: Device) =>
  /Macintosh/.test(device.userAgent) && device.maxTouchPoints > 1;

const isAppleMobile = (device: Device) =>
  /iPhone|iPad|iPod/.test(device.userAgent) || isIpadAsMac(device);

// Other iOS browsers (Chrome, Firefox, Edge) can't install web apps.
const isSafari = (userAgent: string) =>
  /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS/.test(userAgent);

// Chromium browsers fire beforeinstallprompt; Safari on iPhone and iPad
// never does, so it gets Add to Home Screen instructions instead.
export const getInstallMethod = (device: Device): InstallMethod => {
  if (device.hasPromptEvent) {
    return "prompt";
  }
  return isAppleMobile(device) && isSafari(device.userAgent) ? "ios" : null;
};

const isSnoozed = (state: { dismissedAt: number | null; now: number }) =>
  state.dismissedAt !== null && state.now - state.dismissedAt <= SNOOZE_MS;

export const shouldOfferInstall = (state: {
  method: InstallMethod;
  isInstalled: boolean;
  dismissedAt: number | null;
  now: number;
}) => {
  if (!state.method || state.isInstalled) {
    return false;
  }
  return !isSnoozed(state);
};

export const parseDismissedAt = (raw: string | null): number | null => {
  const value = Number(raw);
  return raw && Number.isFinite(value) && value > 0 ? value : null;
};
