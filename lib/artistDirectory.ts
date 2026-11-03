import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";

type Client = SupabaseClient<Database>;

// Uploader id -> artist handle (null: no profile), shared across the page
// so each uploader is looked up at most once per session.
const handles = new Map<string, Promise<string | null>>();

export const lookupHandle = (supabase: Client, userId: string) => {
  const cached = handles.get(userId);
  if (cached) {
    return cached;
  }
  const request = Promise.resolve(
    supabase
      .from("artist_profiles")
      .select("handle")
      .eq("user_id", userId)
      .maybeSingle(),
  ).then(({ data }) => data?.handle ?? null);
  handles.set(userId, request);
  // Don't cache failures: let the next open try again.
  request.catch(() => handles.delete(userId));
  return request;
};

// After someone creates or changes their profile.
export const forgetHandle = (userId: string) => {
  handles.delete(userId);
};
