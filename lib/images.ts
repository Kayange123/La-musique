import { SupabaseClient } from "@supabase/supabase-js";
import uniqid from "uniqid";
import { Database } from "@/types_db";
import { isValidImage } from "./upload";

type Client = SupabaseClient<Database>;

const IMAGE_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

// Removes a file from the images bucket. Callers only do this once nothing
// points at it, so a failure just leaves a harmless orphan.
export const removeImage = async (supabase: Client, path: string | null) => {
  if (!path) {
    return;
  }
  const { error } = await supabase.storage.from("images").remove([path]);
  if (error) {
    console.error(`Couldn't remove images/${path}`, error);
  }
};

// Replaces an image that a row points at (a playlist cover, an avatar):
// upload the new file, point the row at it with `point`, then remove the
// old file. If pointing fails, the new file is removed again and the old
// one is kept.
export const replaceImage = async (
  supabase: Client,
  change: {
    file: File;
    prefix: string;
    oldPath: string | null;
    point: (path: string) => Promise<unknown>;
  },
) => {
  if (!isValidImage(change.file)) {
    throw new Error("Image must be a JPEG, PNG, WebP or GIF under 5MB");
  }
  const extension = IMAGE_EXTENSIONS.get(change.file.type);
  const path = `${change.prefix}-${uniqid()}.${extension}`;
  const upload = await supabase.storage
    .from("images")
    .upload(path, change.file, {
      contentType: change.file.type,
      upsert: false,
    });
  if (upload.error) {
    throw new Error(upload.error.message);
  }
  try {
    await change.point(path);
  } catch (error) {
    await removeImage(supabase, path);
    throw error;
  }
  await removeImage(supabase, change.oldPath);
  return path;
};
