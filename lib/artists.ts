import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";
import { IArtistProfile } from "@/types";
import { replaceImage } from "./images";

type Client = SupabaseClient<Database>;

// Same rules as the database checks on artist_profiles.
export const HANDLE_PATTERN = /^[a-z0-9_]{3,30}$/;
export const MAX_DISPLAY_NAME = 60;
export const MAX_BIO = 500;

const UNIQUE_VIOLATION = "23505";

// Handles are lowercase; accept "@Alice_Sings" and store "alice_sings".
export const cleanHandle = (handle: string) => {
  const cleaned = handle.trim().replace(/^@/, "").toLowerCase();
  if (!HANDLE_PATTERN.test(cleaned)) {
    throw new Error(
      "Handles are 3-30 letters, numbers or underscores, with no spaces",
    );
  }
  return cleaned;
};

// For route params: a valid handle, or null (the page shows not found).
export const parseHandle = (value: string): string | null => {
  let decoded: string;
  try {
    decoded = decodeURIComponent(value).toLowerCase();
  } catch {
    // A malformed escape like %E0%A4%A: not a handle.
    return null;
  }
  return HANDLE_PATTERN.test(decoded) ? decoded : null;
};

export const cleanDisplayName = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Add a display name");
  }
  if (trimmed.length > MAX_DISPLAY_NAME) {
    throw new Error(`Keep the name under ${MAX_DISPLAY_NAME} characters`);
  }
  return trimmed;
};

export const cleanBio = (bio: string): string | null => {
  const trimmed = bio.trim();
  if (trimmed.length > MAX_BIO) {
    throw new Error(`Keep the bio under ${MAX_BIO} characters`);
  }
  return trimmed || null;
};

// Creates the signed-in user's profile, or updates it. RLS limits both
// to their own row.
export const saveArtistProfile = async (
  supabase: Client,
  profile: { userId: string; handle: string; displayName: string; bio: string },
) => {
  const { error } = await supabase.from("artist_profiles").upsert(
    {
      user_id: profile.userId,
      handle: cleanHandle(profile.handle),
      display_name: cleanDisplayName(profile.displayName),
      bio: cleanBio(profile.bio),
    },
    { onConflict: "user_id" },
  );
  if (error?.code === UNIQUE_VIOLATION) {
    throw new Error("That handle is taken");
  }
  if (error) {
    throw new Error(error.message);
  }
};

export const setArtistAvatar = (
  supabase: Client,
  change: {
    profile: Pick<IArtistProfile, "user_id" | "avatar_path">;
    file: File;
  },
) =>
  replaceImage(supabase, {
    file: change.file,
    prefix: `avatar-${change.profile.user_id}`,
    oldPath: change.profile.avatar_path,
    point: async (path) => {
      const { data, error } = await supabase
        .from("artist_profiles")
        .update({ avatar_path: path })
        .eq("user_id", change.profile.user_id)
        .select("user_id");
      if (error || !data?.length) {
        throw new Error(error?.message ?? "Couldn't update your avatar");
      }
    },
  });

// Songs and profiles both reference auth.users, so they can't be joined in
// one query. This fetches the profiles for a page's uploaders, keyed by
// user id; uploaders without a profile are simply absent.
export const getProfilesByUserIds = async (
  supabase: Client,
  userIds: (string | null)[],
): Promise<Map<string, IArtistProfile>> => {
  const ids = Array.from(
    new Set(userIds.filter((id): id is string => Boolean(id))),
  );
  if (ids.length === 0) {
    return new Map();
  }
  const { data } = await supabase
    .from("artist_profiles")
    .select("*")
    .in("user_id", ids);
  return new Map((data ?? []).map((profile) => [profile.user_id, profile]));
};
