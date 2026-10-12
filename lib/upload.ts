export const MAX_SONG_SIZE = 20 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// No SVG: it can carry scripts that run when its public URL is opened.
// Keep in sync with the images bucket's allowed_mime_types.
export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

type FileInfo = Pick<File, "name" | "type" | "size">;

// Browsers report mp3 files as audio/mpeg, audio/mp3 or an empty type.
export const isValidSong = (file: FileInfo) => {
  const isMp3 =
    file.name.toLowerCase().endsWith(".mp3") ||
    ["audio/mpeg", "audio/mp3"].includes(file.type);
  return isMp3 && file.size <= MAX_SONG_SIZE;
};

export const isValidImage = (file: FileInfo) =>
  IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;

export const toSafeFileName = (value: string) =>
  value
    .normalize("NFKD")
    // NFKD splits accented letters into a letter plus a combining mark.
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 50) || "untitled";
