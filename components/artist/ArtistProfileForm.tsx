"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IArtistProfile } from "@/types";
import { useSupabase } from "@/providers/Supabase";
import {
  MAX_BIO,
  MAX_DISPLAY_NAME,
  cleanHandle,
  saveArtistProfile,
  setArtistAvatar,
} from "@/lib/artists";
import { IMAGE_TYPES } from "@/lib/upload";
import { forgetHandle } from "@/lib/artistDirectory";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ArtistAvatar from "./ArtistAvatar";
import { sectionTitle } from "../ui/styles";

const fieldLabel = "flex flex-col gap-y-1.5 text-sm font-semibold text-fg";

// Creates or edits the signed-in user's public artist profile.
const ArtistProfileForm = ({
  userId,
  profile,
  avatarUrl,
}: {
  userId: string;
  profile: IArtistProfile | null;
  avatarUrl: string | null;
}) => {
  const { supabaseClient } = useSupabase();
  const router = useRouter();
  const [handle, setHandle] = useState(profile?.handle ?? "");
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await saveArtistProfile(supabaseClient, {
        userId,
        handle,
        displayName,
        bio,
      });
      if (avatar) {
        await setArtistAvatar(supabaseClient, {
          profile: {
            user_id: userId,
            avatar_path: profile?.avatar_path ?? null,
          },
          file: avatar,
        });
      }
      forgetHandle(userId);
      // Show the handle as it was saved ("@Me" becomes "me").
      setHandle(cleanHandle(handle));
      toast.success(profile ? "Profile updated" : "Profile created");
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      aria-labelledby="artist-profile-heading"
      className="flex flex-col gap-y-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="artist-profile-heading" className={sectionTitle}>
          Artist profile
        </h2>
        {profile && (
          <Link
            href={`/artist/${profile.handle}`}
            className="text-sm font-semibold text-accent hover:text-accent-hover"
          >
            View your page
          </Link>
        )}
      </div>
      <p className="text-muted max-w-prose">
        {profile
          ? "This is how listeners see you. Your songs appear on your page."
          : "Create a public page for your music. Listeners can open it from your songs."}
      </p>
      <form onSubmit={onSubmit} className="flex flex-col gap-y-4 max-w-xl">
        <div className="flex items-center gap-x-4">
          <ArtistAvatar
            name={displayName || handle || "?"}
            userId={userId}
            url={avatarUrl}
            className="h-16 w-16 text-2xl"
          />
          <label className={fieldLabel}>
            Avatar
            <input
              type="file"
              accept={IMAGE_TYPES.join(",")}
              disabled={isSaving}
              onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
              className="text-sm font-normal text-muted file:mr-3 file:rounded-full file:border-0 file:bg-raised file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-fg"
            />
          </label>
        </div>
        <label className={fieldLabel}>
          Display name
          <Input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={MAX_DISPLAY_NAME}
            disabled={isSaving}
            required
          />
        </label>
        <label className={fieldLabel}>
          Handle
          <div className="flex items-center rounded-lg border border-line bg-overlay focus-within:border-accent">
            <span className="pl-3 text-muted" aria-hidden="true">
              @
            </span>
            <Input
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              maxLength={31}
              disabled={isSaving}
              required
              aria-describedby="handle-hint"
              className="border-0 pl-1 focus:border-0"
            />
          </div>
          <span id="handle-hint" className="text-xs font-normal text-muted">
            3-30 lowercase letters, numbers or underscores. Your page will be at
            /artist/{handle.trim().replace(/^@/, "").toLowerCase() || "handle"}.
          </span>
        </label>
        <label className={fieldLabel}>
          <span className="flex justify-between">
            Bio
            <span className="font-normal text-muted">Optional</span>
          </span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={MAX_BIO}
            rows={4}
            disabled={isSaving}
            className="rounded-lg border border-line bg-overlay p-3 text-[15px] font-normal text-fg placeholder:text-muted transition focus:border-accent"
          />
          <span className="self-end font-mono text-xs font-normal text-muted">
            {bio.length} / {MAX_BIO}
          </span>
        </label>
        <Button type="submit" disabled={isSaving} className="sm:w-48">
          {isSaving ? "Saving..." : profile ? "Save profile" : "Create profile"}
        </Button>
      </form>
    </section>
  );
};

export default ArtistProfileForm;
