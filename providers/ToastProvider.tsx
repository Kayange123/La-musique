"use client";
import { Toaster } from "react-hot-toast";
import { colors } from "@/lib/theme";

const ToastProvider = () => {
  return (
    <Toaster
      toastOptions={{
        style: {
          background: colors.overlay,
          color: colors.fg,
          border: `1px solid ${colors.line}`,
          borderRadius: "12px",
        },
        success: {
          iconTheme: { primary: colors.accent, secondary: colors["on-accent"] },
        },
        error: {
          iconTheme: { primary: colors.danger, secondary: colors["on-accent"] },
        },
      }}
    />
  );
};

export default ToastProvider;
