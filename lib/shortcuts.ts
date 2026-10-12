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

// Space already activates a focused button, and arrows already move a
// focused slider, so the shortcut would fire twice.
const handlesKeyItself = (target: KeyInfo["target"], key: string) => {
  if (!target) {
    return false;
  }
  if (key === " " && target.tagName === "BUTTON") {
    return true;
  }
  const role = target.getAttribute?.("role");
  return key.startsWith("Arrow") && role === "slider";
};

// Maps a keydown to a player action, or null when the key should be left
// alone: while typing, with Ctrl/Cmd/Alt held, or when the focused
// control already handles it.
export const getShortcutAction = (event: KeyInfo): ShortcutAction | null => {
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return null;
  }
  const { target } = event;
  if (
    target &&
    (TYPING_TAGS.includes(target.tagName ?? "") || target.isContentEditable)
  ) {
    return null;
  }
  if (handlesKeyItself(target, event.key)) {
    return null;
  }

  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (event.shiftKey) {
    if (key === "n") return "next";
    if (key === "p") return "previous";
    return null;
  }
  switch (key) {
    case " ":
    case "k":
      return "toggle-play";
    case "ArrowRight":
      return "seek-forward";
    case "ArrowLeft":
      return "seek-backward";
    case "m":
      return "toggle-mute";
    default:
      return null;
  }
};
