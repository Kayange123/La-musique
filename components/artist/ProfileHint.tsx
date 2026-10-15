"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSupabase } from "@/providers/Supabase";
import { lookupHandle } from "@/lib/artistDirectory";

interface ProfileHintProps {
  userId: string;
  onNavigate: () => void;
}

// Shown to uploaders without an artist profile: their songs have no page
// to link to until they make one.
const ProfileHint = ({ userId, onNavigate }: ProfileHintProps) => {
  const { supabaseClient } = useSupabase();
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let current = true;
    lookupHandle(supabaseClient, userId)
      .then((handle) => current && setMissing(handle === null))
      .catch(() => current && setMissing(false));
    return () => {
      current = false;
    };
  }, [supabaseClient, userId]);

  if (!missing) {
    return null;
  }
  return (
    <p className="rounded-lg bg-raised px-3 py-2 text-sm text-muted">
      Listeners can&apos;t find your page yet.{" "}
      <Link
        href="/account"
        onClick={onNavigate}
        className="font-semibold text-accent hover:text-accent-hover"
      >
        Create an artist profile
      </Link>
    </p>
  );
};

export default ProfileHint;
