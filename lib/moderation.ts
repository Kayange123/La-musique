import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types_db";
import { ISong } from "@/types";

type Client = SupabaseClient<Database>;

export const REPORT_REASONS = [
  { value: "copyright", label: "It's someone else's music" },
  { value: "abuse", label: "Hateful or abusive" },
  { value: "spam", label: "Spam or misleading" },
  { value: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];

export const MAX_REPORT_DETAILS = 500;

export type ModerationAction = "hide" | "dismiss" | "restore";

const isReason = (value: string): value is ReportReason =>
  REPORT_REASONS.some((reason) => reason.value === value);

// Database refusals with a friendlier message: one report per listener
// per song (a unique constraint), and the insert policy only matching
// songs the reporter can see.
const REPORT_ERRORS: Record<string, string> = {
  "23505": "You've already reported this song",
  "42501": "This song can't be reported",
};

// Checks the form before asking the database; returns the details to
// store (blank becomes null).
const validateReport = (reason: string, details: string) => {
  if (!isReason(reason)) {
    throw new Error("Choose a reason");
  }
  const trimmed = details.trim();
  if (trimmed.length > MAX_REPORT_DETAILS) {
    throw new Error(`Keep details under ${MAX_REPORT_DETAILS} characters`);
  }
  return { reason, details: trimmed || null };
};

export const reportSong = async (
  supabase: Client,
  {
    songId,
    reason,
    details,
  }: { songId: number; reason: string; details: string },
) => {
  const report = validateReport(reason, details);
  const { error } = await supabase
    .from("song_reports")
    .insert({ song_id: songId, ...report });
  if (error) {
    throw new Error(REPORT_ERRORS[error.code] ?? error.message);
  }
};

export const moderateSong = async (
  supabase: Client,
  { songId, action }: { songId: number; action: ModerationAction },
) => {
  const { error } = await supabase.rpc("moderate_song", {
    target: songId,
    action,
  });
  if (error) {
    throw new Error(error.message);
  }
};

export interface ReportRow {
  song_id: number;
  reason: string;
  details: string | null;
  created_at: string;
  songs: ISong | null;
}

export interface ReportedSong {
  song: ISong;
  reports: { reason: string; details: string | null; createdAt: string }[];
}

// Open reports (oldest first) grouped by song, most reported first; ties
// keep the song reported earliest first.
export const groupReports = (rows: ReportRow[]): ReportedSong[] => {
  const bySong = new Map<number, ReportedSong>();
  for (const row of rows) {
    if (!row.songs) {
      continue;
    }
    const entry = bySong.get(row.song_id) ?? { song: row.songs, reports: [] };
    entry.reports.push({
      reason: row.reason,
      details: row.details,
      createdAt: row.created_at,
    });
    bySong.set(row.song_id, entry);
  }
  // Stable sort, so equal counts stay in first-report order.
  return Array.from(bySong.values()).sort(
    (a, b) => b.reports.length - a.reports.length,
  );
};

export const reasonLabel = (reason: string) =>
  REPORT_REASONS.find((option) => option.value === reason)?.label ?? reason;
