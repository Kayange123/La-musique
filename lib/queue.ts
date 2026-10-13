// Next and previous wrap around the ends of the queue. If the active song
// isn't in the queue, both start from the beginning or the end.
export const getNextId = <T>(ids: T[], activeId?: T): T | undefined => {
  if (ids.length === 0) {
    return undefined;
  }
  const currentIndex = ids.findIndex((id) => id === activeId);
  return ids[currentIndex + 1] ?? ids[0];
};

export const getPreviousId = <T>(ids: T[], activeId?: T): T | undefined => {
  if (ids.length === 0) {
    return undefined;
  }
  const currentIndex = ids.findIndex((id) => id === activeId);
  return ids[currentIndex - 1] ?? ids[ids.length - 1];
};

export type RepeatMode = "off" | "all" | "one";

// What plays when a song ends on its own. Pressing next always wraps,
// whatever the repeat mode, so the listener is never stuck at the end.
export const getAutoNextId = <T>(
  ids: T[],
  activeId: T | undefined,
  repeat: RepeatMode,
): T | undefined => {
  if (repeat === "one") {
    return activeId;
  }
  const currentIndex = ids.findIndex((id) => id === activeId);
  const isLast = currentIndex === ids.length - 1;
  if (repeat === "off" && isLast) {
    return undefined;
  }
  return getNextId(ids, activeId);
};

// Shuffles the queue with the current song first, so previous goes back
// through the songs actually heard. Takes the random source as a
// parameter so tests can make it deterministic.
export const shuffleIds = <T>(
  ids: T[],
  firstId?: T,
  random: () => number = Math.random,
): T[] => {
  const rest = ids.filter((id) => id !== firstId);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return firstId !== undefined && ids.includes(firstId)
    ? [firstId, ...rest]
    : rest;
};

export const nextRepeatMode = (mode: RepeatMode): RepeatMode =>
  mode === "all" ? "one" : mode === "one" ? "off" : "all";

// Removes a song from the queue, e.g. after it's deleted. Returns the new
// queue and which song should play: the next one if the removed song was
// playing, otherwise the current one unchanged.
export const removeFromQueue = <T>(
  queue: T[],
  activeId: T | undefined,
  removedId: T,
): { queue: T[]; activeId: T | undefined } => {
  const index = queue.indexOf(removedId);
  if (index === -1) {
    return { queue, activeId };
  }
  const rest = queue.filter((id) => id !== removedId);
  if (activeId !== removedId) {
    return { queue: rest, activeId };
  }
  // Play whatever moved into the removed song's place, wrapping round.
  return { queue: rest, activeId: rest[index] ?? rest[0] };
};
