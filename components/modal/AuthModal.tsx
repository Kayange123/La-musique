"use client";
import { useEffect } from "react";
import Modal from "./Modal";
import { useSupabase } from "@/providers/Supabase";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";

const AuthModal = () => {
  const router = useRouter();
  const { supabaseClient, session } = useSupabase();
  const { isOpen, onClose } = useAuthModal();

  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  useEffect(() => {
    if (session) {
      router.refresh();
      onClose();
    }
  }, [onClose, router, session]);

  return (
    <Modal
      isopen={isOpen}
      onChange={onChange}
      title="Welcome back"
      description="Auth modal"
    >
      <Auth
        theme="auto"
        providers={["facebook", "google"]}
        magicLink
        socialLayout="horizontal"
        supabaseClient={supabaseClient}
        appearance={{ theme: ThemeSupa }}
      />
    </Modal>
  );
};

export default AuthModal;
