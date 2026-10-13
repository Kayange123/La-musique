// Supabase's per-file upload limit on the free plan; WAV files get big.
export const MAX_SONG_SIZE = 50 * 1024 * 1024;
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

// Supported audio formats: file extension -> the content type the file is
// stored with. Keep in sync with the songs bucket's allowed_mime_types.
export const AUDIO_FORMATS = new Map<string, string>([
  ["mp3", "audio/mpeg"],
  ["m4a", "audio/mp4"],
  ["aac", "audio/aac"],
  ["wav", "audio/wav"],
  ["ogg", "audio/ogg"],
  ["flac", "audio/flac"],
]);

// Browsers disagree on audio content types, and sometimes report none.
const TYPE_TO_EXTENSION = new Map<string, string>([
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/mp4", "m4a"],
  ["audio/x-m4a", "m4a"],
  ["audio/aac", "aac"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
  ["audio/wave", "wav"],
  ["audio/ogg", "ogg"],
  ["audio/flac", "flac"],
  ["audio/x-flac", "flac"],
]);

const extensionOf = (path: string) => {
  const match = /\.([a-z0-9]+)$/i.exec(path);
  return match ? match[1].toLowerCase() : "";
};

// The file's format, from its name if recognised, otherwise its type.
export const getAudioExtension = (file: FileInfo): string | null => {
  const fromName = extensionOf(file.name);
  if (AUDIO_FORMATS.has(fromName)) {
    return fromName;
  }
  return TYPE_TO_EXTENSION.get(file.type) ?? null;
};

export const isValidSong = (file: FileInfo) =>
  getAudioExtension(file) !== null && file.size <= MAX_SONG_SIZE;

// The format to tell the player. Songs uploaded before other formats were
// supported have no extension and are all mp3.
export const getPlaybackFormat = (songPath: string) => {
  const extension = extensionOf(songPath);
  return AUDIO_FORMATS.has(extension) ? extension : "mp3";
};

// For the file picker: ".mp3,.m4a,..."
export const AUDIO_ACCEPT = Array.from(AUDIO_FORMATS.keys())
  .map((extension) => `.${extension}`)
  .join(",");

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
