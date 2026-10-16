"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import Button from "../ui/Button";
import useSongActions from "@/hooks/useSongActions";
import { useSupabase } from "@/providers/Supabase";
import {
  MAX_REPORT_DETAILS,
  REPORT_REASONS,
  reportSong,
} from "@/lib/moderation";
import { ISong } from "@/types";

const reasonRow =
  "flex cursor-pointer items-center gap-x-3 rounded-lg px-3 py-2.5 text-[15px] text-fg transition hover:bg-overlay";

const ReportSongForm = ({ song }: { song: ISong }) => {
  const { close } = useSongActions();
  const { supabaseClient } = useSupabase();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSending, setIsSending] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    try {
      await reportSong(supabaseClient, { songId: song.id, reason, details });
      close();
      toast.success("Thanks. A moderator will take a look.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-y-4">
      <fieldset className="flex flex-col gap-y-1" disabled={isSending}>
        <legend className="mb-2 text-sm font-semibold text-fg">
          What&apos;s wrong with it?
        </legend>
        {REPORT_REASONS.map((option) => (
          <label
            key={option.value}
            className={`${reasonRow} ${reason === option.value ? "bg-overlay" : ""}`}
          >
            <input
              type="radio"
              name="reason"
              value={option.value}
              checked={reason === option.value}
              onChange={() => setReason(option.value)}
              className="h-4 w-4"
              required
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-y-1.5 text-sm font-semibold text-fg">
        <span className="flex justify-between">
          Details
          <span className="font-normal text-muted">Optional</span>
        </span>
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={MAX_REPORT_DETAILS}
          rows={3}
          disabled={isSending}
          placeholder="Anything that helps, like where the original is"
          className="rounded-lg border border-line bg-overlay p-3 text-[15px] font-normal text-fg placeholder:text-muted transition focus:border-accent"
        />
      </label>
      <Button type="submit" disabled={isSending || !reason}>
        {isSending ? "Sending..." : "Send report"}
      </Button>
    </form>
  );
};

const ReportSongModal = () => {
  const { song, mode, close } = useSongActions();

  return (
    <Modal
      isopen={mode === "report"}
      onChange={(open) => !open && close()}
      title="Report song"
      description={
        song
          ? `Tell us what's wrong with "${song.title}". The uploader won't see who reported it.`
          : ""
      }
    >
      {/* Keyed so each report starts blank. */}
      {song && <ReportSongForm key={song.id} song={song} />}
    </Modal>
  );
};

export default ReportSongModal;
