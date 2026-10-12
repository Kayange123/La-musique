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
