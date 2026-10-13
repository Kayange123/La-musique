"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import useAuthModal from "@/hooks/useAuthModal";
import { useSupabase } from "@/providers/Supabase";
import { useUser } from "@/hooks/useUser";
import { FaUserAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { pillOutline } from "./styles";

const navButton =
  "grid h-9 w-9 place-items-center rounded-full bg-canvas text-fg transition hover:bg-raised";

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
}
const Heading = ({ children, className }: HeadingProps) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const { supabaseClient } = useSupabase();
  const { user } = useUser();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Successfully logged out");
    }
    router.refresh();
  };
  // The account button shows the first letter of the email.
  const initial = user?.email?.charAt(0).toUpperCase() ?? "";

  return (
    <div className={twMerge("h-fit px-6 pt-5 pb-6", className)}>
      <div className="w-full mb-6 flex items-center justify-between gap-x-3">
        <div className="hidden md:flex gap-x-2 items-center">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className={navButton}
          >
            <RxCaretLeft size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Go forward"
            onClick={() => router.forward()}
            className={navButton}
          >
            <RxCaretRight size={24} aria-hidden="true" />
          </button>
        </div>
        <div className="flex md:hidden gap-x-2 items-center">
          <Link href="/" aria-label="Home" className={navButton}>
            <HiHome size={18} aria-hidden="true" />
          </Link>
          <Link href="/search" aria-label="Search" className={navButton}>
            <BiSearch size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="flex items-center gap-x-2">
          {user ? (
            <>
              <button
                type="button"
                onClick={handleLogout}
                className={pillOutline}
              >
                Log out
              </button>
              <Link
                href="/account"
                aria-label="Account"
                className="grid h-10 w-10 place-items-center rounded-full bg-accent font-display text-lg font-bold text-on-accent transition hover:bg-accent-hover"
              >
                {initial || <FaUserAlt size={16} aria-hidden="true" />}
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={authModal.onOpen}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:text-fg"
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={authModal.onOpen}
                className="rounded-full bg-fg px-5 py-2 text-sm font-bold text-on-accent transition hover:scale-105"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default Heading;
