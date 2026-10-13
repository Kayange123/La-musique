"use client";

import { useState, useEffect } from "react";
import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import { useSupabase } from "@/providers/Supabase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { IconType } from "react-icons";

interface LikeButtonProps {
  songId: number;
}

const LikeButton = ({ songId }: LikeButtonProps) => {
  const router = useRouter();
  const { supabaseClient } = useSupabase();
  const authModal = useAuthModal();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchData = async () => {
      const { data, error } = await supabaseClient
        .from("liked_songs")
        .select("*")
        .eq("user_id", user.id)
        .eq("song_id", songId)
        .maybeSingle();
      setIsLiked(!error && !!data);
    };
    fetchData();
  }, [user, songId, supabaseClient]);

  // A like from a previous session never shows once logged out.
  const liked = !!user && isLiked;
  const Icon: IconType = liked ? AiFillHeart : AiOutlineHeart;
  const handleLike = async () => {
    if (!user) {
      return authModal.onOpen();
    }
    if (liked) {
      const { error } = await supabaseClient
        .from("liked_songs")
        .delete()
        .eq("user_id", user?.id)
        .eq("song_id", songId);

      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(false);
      }
    } else {
      const { error } = await supabaseClient.from("liked_songs").insert({
        song_id: songId,
        user_id: user?.id,
      });
      if (error) {
        toast.error(error.message);
      } else {
        setIsLiked(true);
      }
    }
    router.refresh();
  };
  return (
    <button
      type="button"
      onClick={handleLike}
      aria-label={liked ? "Remove from liked songs" : "Add to liked songs"}
      aria-pressed={liked}
      className={`grid place-items-center h-10 w-10 shrink-0 rounded-full transition ${
        liked
          ? "text-accent hover:text-accent-hover"
          : "text-muted hover:text-fg"
      }`}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
};

export default LikeButton;
