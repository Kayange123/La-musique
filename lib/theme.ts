// The redesign's colours, by role. Tailwind reads these (see
// tailwind.config.ts), and lib/theme.test.ts checks their contrast, so
// change them here only.
export const colors = {
  // Backgrounds, darkest to lightest.
  canvas: "#0D0E0C", // the app behind everything
  surface: "#17181A", // panels: sidebar, main area, queue
  raised: "#202226", // cards, rows on hover, chips
  overlay: "#26282C", // dialogs' inputs and menus
  band: "#2B2620", // the warm header band on playlist pages
  line: "#2A2D31", // dividers and borders
  "line-strong": "#4A4D52", // outlined buttons
  // Text.
  fg: "#F3F1EA", // primary text
  muted: "#A3A39C", // secondary text
  subtle: "#8C8C85", // captions and labels, on canvas and surface only
  // The one accent, and text placed on it.
  accent: "#FF8A3D",
  "accent-hover": "#FFB27A",
  "on-accent": "#0D0E0C",
  // Destructive actions.
  danger: "#FF7A6B", // text and icons
  "danger-bg": "#E5533F", // filled buttons, with on-accent text
} as const;

export type ColorToken = keyof typeof colors;

// Playlist tiles: a light colour per playlist, with its initial in
// on-accent on top.
export const tileColors = [
  "#FFB27A",
  "#9DB8F5",
  "#C8E3A1",
  "#D3B5F2",
  "#F2D58A",
] as const;

export const tileColor = (id: number) => tileColors[id % tileColors.length];

// Which text colours are used on which backgrounds. The contrast test
// checks every pair listed here.
export const textOn: Record<string, ColorToken[]> = {
  fg: ["canvas", "surface", "raised", "overlay", "band"],
  muted: ["canvas", "surface", "raised", "overlay", "band"],
  subtle: ["canvas", "surface"],
  accent: ["canvas", "surface", "raised"],
  danger: ["canvas", "surface", "raised", "overlay"],
  "on-accent": ["accent", "accent-hover", "danger-bg", "fg"],
};
