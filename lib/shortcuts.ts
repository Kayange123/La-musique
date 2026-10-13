export type ShortcutAction =
  | "toggle-play"
  | "seek-forward"
  | "seek-backward"
  | "next"
  | "previous"
  | "toggle-mute";

interface KeyInfo {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  target: {
    tagName?: string;
    isContentEditable?: boolean;
    getAttribute?: (name: string) => string | null;
  } | null;
}

const TYPING_TAGS = ["INPUT", "TEXTAREA", "SELECT"];

const KEYS = new Map<string, ShortcutAction>([
  [" ", "toggle-play"],
  ["k", "toggle-play"],
  ["ArrowRight", "seek-forward"],
  ["ArrowLeft", "seek-backward"],
  ["m", "toggle-mute"],
]);

const SHIFT_KEYS = new Map<string, ShortcutAction>([
  ["n", "next"],
  ["p", "previous"],
]);

type Target = KeyInfo["target"];

const isTypingTag = (target: Target) =>
  TYPING_TAGS.includes(target?.tagName ?? "");

const isContentEditable = (target: Target) => !!target?.isContentEditable;

// Space already activates a focused button, and arrows already move a
// focused slider, so the shortcut would fire twice.
const isSpaceOnButton = (event: KeyInfo) =>
  event.key === " " && event.target?.tagName === "BUTTON";

const isArrowOnSlider = (event: KeyInfo) =>
  event.key.startsWith("Arrow") &&
  event.target?.getAttribute?.("role") === "slider";

const hasModifier = (event: KeyInfo) =>
  [event.ctrlKey, event.metaKey, event.altKey].some(Boolean);

const IGNORE_RULES: ((event: KeyInfo) => boolean)[] = [
  hasModifier,
  (event) => isTypingTag(event.target),
  (event) => isContentEditable(event.target),
  isSpaceOnButton,
  isArrowOnSlider,
];

// Maps a keydown to a player action, or null when the key should be left
// alone: while typing, with Ctrl/Cmd/Alt held, or when the focused
// control already handles it.
export const getShortcutAction = (event: KeyInfo): ShortcutAction | null => {
  if (IGNORE_RULES.some((rule) => rule(event))) {
    return null;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const table = event.shiftKey ? SHIFT_KEYS : KEYS;
  return table.get(key) ?? null;
};
