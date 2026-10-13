// Where the listener stopped, kept in this browser so Home can offer to
// resume. Cleared when a song finishes or the user signs out.
export const RESUME_KEY = "la-musique:resume";

// Older offers aren't worth showing.
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
// Too close to either end to be worth resuming.
const MIN_POSITION_SECONDS = 5;

export interface ResumePoint {
  songId: number;
  position: number;
  savedAt: number;
}

export const toResumePoint = (point: {
  songId: number;
  position: number;
  duration: number;
  now: number;
}): ResumePoint | null => {
  const nearEnd = point.duration - point.position < MIN_POSITION_SECONDS;
  if (point.position < MIN_POSITION_SECONDS || nearEnd) {
    return null;
  }
  return {
    songId: point.songId,
    position: Math.floor(point.position),
    savedAt: point.now,
  };
};

const isPositiveNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

// Storage is user-editable, so anything malformed or stale is ignored.
export const parseResumePoint = (
  raw: string | null,
  options: { now: number },
): ResumePoint | null => {
  if (!raw) {
    return null;
  }
  try {
    const value = JSON.parse(raw);
    const fields = [value?.songId, value?.position, value?.savedAt];
    if (!fields.every(isPositiveNumber)) {
      return null;
    }
    if (options.now - value.savedAt > MAX_AGE_MS) {
      return null;
    }
    return {
      songId: value.songId,
      position: value.position,
      savedAt: value.savedAt,
    };
  } catch {
    return null;
  }
};
