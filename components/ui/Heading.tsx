"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import Button from "./Button";
import useAuthModal from "@/hooks/useAuthModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useUser } from "@/hooks/useUser";
import { FaUserAlt } from "react-icons/fa";
import toast from "react-hot-toast";

interface HeadingProps {
  children: React.ReactNode;
  className?: string;
}
const Heading = ({ children, className }: HeadingProps) => {
  const router = useRouter();
  const authModal = useAuthModal();
  const supabaseClient = useSupabaseClient();
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
  return (
    <div
      className={twMerge(
        "h-fit bg-gradient-to-b from-emerald-900 p-6",
        className
      )}
    >
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="hidden md:flex gap-x-2 items-center">
          <button
            onClick={() => router.back()}
            className="rounded-full bg-black flex items-center justify-center hover:opacity-75 transition"
          >
            <RxCaretLeft size={30} className="text-white" />
          </button>
          <button
            onClick={() => router.forward()}
            className="rounded-full bg-black flex items-center justify-center hover:opacity-75 transition"
          >
            <RxCaretRight size={30} className="text-white" />
          </button>
        </div>
        <div className="flex md:hidden gap-x-3 items-center">
          <button className="bg-white rounded-full p-2 hover:opacity-75 transition flex items-center justify-center">
            <HiHome className="text-black" size={20} />
          </button>
          <button className="bg-white rounded-full p-2 hover:opacity-75 transition flex items-center justify-center">
            <BiSearch className="text-black" size={20} />
          </button>
        </div>
        <div className="flex justify-between items-center gap-x-4">
          {user ? (
            <div className="flex items-center gap-x-4">
              <Button onClick={handleLogout} className="bg-white px-3 py-2">
                Logout
              </Button>
              <Button
                onClick={() => router.push("/account")}
                className="bg-white p-3"
              >
                <FaUserAlt size={20} />
              </Button>
            </div>
          ) : (
            <>
              <div className="">
                <Button
                  onClick={authModal.onOpen}
                  className="bg-transparent font-medium text-neutral-300"
                >
                  Sign up
                </Button>
              </div>
              <div>
                <Button
                  onClick={authModal.onOpen}
                  className="bg-white px-4 py-2"
                >
                  Sign in
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

export default Heading;
