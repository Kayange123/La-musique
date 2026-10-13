"use client";

import { useEffect, useState } from "react";
import { FiShare, FiX } from "react-icons/fi";
import { twMerge } from "tailwind-merge";
import usePlayer from "@/hooks/usePlayer";
import { iconButton, pillAccent, pillOutline } from "../ui/styles";
import {
  INSTALL_DISMISSED_KEY,
  InstallMethod,
  getInstallMethod,
  parseDismissedAt,
  shouldOfferInstall,
} from "@/lib/install";

// Chromium's install event; TypeScript's DOM types don't include it.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const readDismissedAt = () => {
  try {
    return parseDismissedAt(localStorage.getItem(INSTALL_DISMISSED_KEY));
  } catch {
    return null;
  }
};

const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // Safari's own flag for home-screen apps.
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

// "Add La-musique to your home screen", on phone-sized screens only:
// desktop browsers already show an install button in the address bar.
const InstallPrompt = () => {
  const [method, setMethod] = useState<InstallMethod>(null);
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasPlayer = usePlayer((state) => state.activeId !== undefined);

  useEffect(() => {
    const offer = (event: BeforeInstallPromptEvent | null) => {
      const nextMethod = getInstallMethod({
        userAgent: navigator.userAgent,
        hasPromptEvent: event !== null,
        maxTouchPoints: navigator.maxTouchPoints,
      });
      setMethod(nextMethod);
      setPromptEvent(event);
      setIsVisible(
        shouldOfferInstall({
          method: nextMethod,
          isInstalled: isInstalled(),
          dismissedAt: readDismissedAt(),
          now: Date.now(),
        }),
      );
    };

    const onPrompt = (event: Event) => {
      // Keep the browser's mini-bar away; we show our own prompt.
      event.preventDefault();
      offer(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setIsVisible(false);

    offer(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!isVisible || !method) {
    return null;
  }

  const dismiss = () => {
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
    } catch {
      // Storage blocked: it'll simply be offered again next visit.
    }
    setIsVisible(false);
  };

  const install = async () => {
    if (!promptEvent) {
      return;
    }
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // The event can only be used once.
    setPromptEvent(null);
    if (outcome === "accepted") {
      setIsVisible(false);
    } else {
      dismiss();
    }
  };

  return (
    <section
      aria-labelledby="install-heading"
      className={twMerge(
        "md:hidden fixed inset-x-2 z-40 rounded-xl border border-line bg-surface p-4 shadow-2xl flex flex-col gap-y-3",
        // Sit above the tab bar, and above the player when it's showing.
        hasPlayer ? "bottom-[calc(4rem+88px)]" : "bottom-[calc(4rem+8px)]",
      )}
    >
      <div className="flex items-start gap-x-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- static app icon */}
        <img
          src="/icons/icon-192.png"
          alt=""
          width={48}
          height={48}
          className="rounded-xl"
        />
        <div className="flex-1">
          <h2
            id="install-heading"
            className="font-display text-lg font-bold leading-tight"
          >
            Add La-musique to your home screen
          </h2>
          <p className="text-sm text-muted">
            Opens full screen, with lock-screen controls. No app store needed.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          className={iconButton}
        >
          <FiX size={20} aria-hidden="true" />
        </button>
      </div>
      {method === "prompt" ? (
        <div className="flex gap-x-2">
          <button
            type="button"
            onClick={dismiss}
            className={`${pillOutline} flex-1 py-2.5`}
          >
            Not now
          </button>
          <button
            type="button"
            onClick={install}
            className={`${pillAccent} flex-1 py-2.5`}
          >
            Install
          </button>
        </div>
      ) : (
        <p className="flex items-center gap-x-2 text-sm">
          Tap
          <FiShare size={18} aria-label="Share" />
          then <strong>Add to Home Screen</strong>.
        </p>
      )}
    </section>
  );
};

export default InstallPrompt;
