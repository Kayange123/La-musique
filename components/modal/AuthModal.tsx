"use client";
import { useEffect } from "react";
import Modal from "./Modal";
import { useSupabase } from "@/providers/Supabase";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";
import { colors } from "@/lib/theme";

// Supabase's form brings its own green theme; these swap in ours.
const themeVariables = {
  colors: {
    brand: colors.accent,
    brandAccent: colors["accent-hover"],
    brandButtonText: colors["on-accent"],
    defaultButtonBackground: colors.raised,
    defaultButtonBackgroundHover: colors.overlay,
    defaultButtonBorder: colors.line,
    defaultButtonText: colors.fg,
    dividerBackground: colors.line,
    inputBackground: colors.overlay,
    inputBorder: colors.line,
    inputBorderHover: colors["line-strong"],
    inputBorderFocus: colors.accent,
    inputText: colors.fg,
    inputLabelText: colors.muted,
    inputPlaceholder: colors.muted,
    messageText: colors.muted,
    messageTextDanger: colors.danger,
    anchorTextColor: colors.muted,
    anchorTextHoverColor: colors.fg,
  },
  fonts: {
    bodyFontFamily: "var(--font-body)",
    buttonFontFamily: "var(--font-body)",
    inputFontFamily: "var(--font-body)",
    labelFontFamily: "var(--font-body)",
  },
  radii: {
    borderRadiusButton: "9999px",
    buttonBorderRadius: "9999px",
    inputBorderRadius: "8px",
  },
};

// The form picks "default" or "dark"; both get the same values.
const authVariables = { default: themeVariables, dark: themeVariables };

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
      description="Sign in or create an account to listen."
    >
      <Auth
        theme="dark"
        providers={["facebook", "google"]}
        magicLink
        socialLayout="horizontal"
        supabaseClient={supabaseClient}
        appearance={{ theme: ThemeSupa, variables: authVariables }}
      />
    </Modal>
  );
};

export default AuthModal;
