// The guided tour shown once to signed-in listeners. Steps point at
// elements marked data-tour="<anchor>"; a step with several anchors uses
// the first one on screen (the sidebar on desktop, the tab bar on
// phones), and is skipped when none is. A step with no anchors is a
// centred card.

export interface TourStep {
  id: string;
  anchors: string[];
  title: string;
  body: string;
  // Only for devices with a mouse or trackpad (keyboard tips).
  finePointerOnly?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    anchors: [],
    title: "Welcome to La-musique",
    body: "Here's a quick look around. It takes less than a minute.",
  },
  {
    id: "nav",
    anchors: ["nav", "mobile-nav"],
    title: "Home and Search",
    body: "Home has the newest songs and what you played recently. Search finds songs by title and artists by name.",
  },
  {
    id: "library",
    anchors: ["playlists", "mobile-library"],
    title: "Your library",
    body: "Make playlists for anything, and keep your uploads together. Add a song to a playlist from its ⋯ menu.",
  },
  {
    id: "upload",
    anchors: ["upload"],
    title: "Share your music",
    body: "Upload a song with its cover art. Set up an artist profile on your Account page so listeners can find all your songs.",
  },
  {
    id: "songs",
    anchors: ["new-songs"],
    title: "Start listening",
    body: "Pick any song to play it. The player opens at the bottom, with shuffle, repeat and what's up next.",
  },
  {
    id: "account",
    anchors: ["account"],
    title: "Your account",
    body: "Your stats and artist profile live here. You can take this tour again from there.",
  },
  {
    id: "shortcuts",
    anchors: [],
    finePointerOnly: true,
    title: "Handy shortcuts",
    body: "Space or K plays and pauses, ← and → skip 5 seconds, Shift+N and Shift+P change song, and M mutes.",
  },
];

// The steps this screen can show, in order.
export const stepsToShow = (
  steps: TourStep[],
  env: { hasAnchor: (name: string) => boolean; finePointer: boolean },
) =>
  steps.filter((step) => {
    if (step.anchors.length === 0) {
      return env.finePointer || !step.finePointerOnly;
    }
    return step.anchors.some(env.hasAnchor);
  });

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
interface Size {
  width: number;
  height: number;
}

const GAP = 12;
const MARGIN = 16;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), Math.max(min, max));

// Where the card goes next to the highlighted element: below, above,
// right or left, whichever fits first; below if none does. Always kept
// inside the screen.
export const placeCard = ({
  target,
  card,
  viewport,
}: {
  target: Rect;
  card: Size;
  viewport: Size;
}) => {
  const candidates = [
    { top: target.top + target.height + GAP, left: target.left },
    { top: target.top - GAP - card.height, left: target.left },
    { top: target.top, left: target.left + target.width + GAP },
    { top: target.top, left: target.left - GAP - card.width },
  ];
  const fits = (spot: { top: number; left: number }) =>
    spot.top >= MARGIN &&
    spot.left >= MARGIN &&
    spot.top + card.height <= viewport.height - MARGIN &&
    spot.left + card.width <= viewport.width - MARGIN;
  const spot = candidates.find(fits) ?? candidates[0];
  return {
    top: clamp(spot.top, MARGIN, viewport.height - MARGIN - card.height),
    left: clamp(spot.left, MARGIN, viewport.width - MARGIN - card.width),
  };
};

// Seen once per account in this browser: on finishing, skipping or
// closing the tour.
export const tourSeenKey = (userId: string) => `la-musique:tour-seen:${userId}`;

export const parseTourSeen = (raw: string | null) => raw !== null;
