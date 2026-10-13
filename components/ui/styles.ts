// Class strings shared across the redesign, so the same element looks the
// same everywhere. Colours come from lib/theme.ts via Tailwind.

export const pageTitle =
  "font-display text-3xl md:text-4xl font-bold tracking-tight text-fg";

export const sectionTitle =
  "font-display text-xl md:text-2xl font-bold tracking-tight text-fg";

// Small uppercase labels, e.g. "Now playing". Muted rather than subtle,
// so they pass contrast on every surface.
export const eyebrow =
  "text-xs font-semibold uppercase tracking-wider text-muted";

const iconButtonShape =
  "grid place-items-center rounded-full p-2 transition disabled:opacity-30";

export const iconButton = `${iconButtonShape} text-muted hover:text-fg disabled:hover:text-muted`;

export const iconButtonDanger = `${iconButtonShape} text-muted hover:text-danger`;

export const roundIconButton =
  "grid place-items-center h-9 w-9 rounded-full bg-raised text-fg transition hover:bg-overlay";

export const pillOutline =
  "inline-flex items-center justify-center gap-x-2 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-fg transition hover:border-fg";

export const pillAccent =
  "inline-flex items-center justify-center gap-x-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-on-accent transition hover:bg-accent-hover";

// The big round play button on pages and cards.
export const playButton =
  "grid place-items-center rounded-full bg-accent text-on-accent shadow-lg transition hover:scale-105 hover:bg-accent-hover disabled:opacity-50";

export const panel = "bg-surface rounded-xl";
