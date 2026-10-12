"use client";

import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { MAX_PLAYLIST_NAME } from "@/lib/playlists";

interface PlaylistNameFormProps {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<void>;
}

// Shared by the create and rename dialogs.
const PlaylistNameForm = ({
  initialName = "",
  submitLabel,
  onSubmit,
}: PlaylistNameFormProps) => {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onSubmit(name);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
      <label className="flex flex-col gap-y-1 text-sm">
        Name
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_PLAYLIST_NAME}
          disabled={isSaving}
          autoFocus
          required
        />
      </label>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};

export default PlaylistNameForm;
