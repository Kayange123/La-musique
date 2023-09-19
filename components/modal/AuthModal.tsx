"use client";
import { useEffect } from "react";
import Modal from "./Modal";
import {
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";

const AuthModal = () => {
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { session } = useSessionContext();
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
