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

const isTyping = (target: KeyInfo["target"]) =>
  !!target &&
  (TYPING_TAGS.includes(target.tagName ?? "") || !!target.isContentEditable);

// Space already activates a focused button, and arrows already move a
// focused slider, so the shortcut would fire twice.
const handlesKeyItself = (target: KeyInfo["target"], key: string) =>
  (key === " " && target?.tagName === "BUTTON") ||
  (key.startsWith("Arrow") && target?.getAttribute?.("role") === "slider");

const hasModifier = (event: KeyInfo) =>
  event.ctrlKey || event.metaKey || event.altKey;

// Maps a keydown to a player action, or null when the key should be left
// alone: while typing, with Ctrl/Cmd/Alt held, or when the focused
// control already handles it.
export const getShortcutAction = (event: KeyInfo): ShortcutAction | null => {
  if (
    hasModifier(event) ||
    isTyping(event.target) ||
    handlesKeyItself(event.target, event.key)
  ) {
    return null;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const table = event.shiftKey ? SHIFT_KEYS : KEYS;
  return table.get(key) ?? null;
};
