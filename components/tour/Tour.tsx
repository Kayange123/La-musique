"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import useTour from "@/hooks/useTour";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import {
  TOUR_STEPS,
  TourStep,
  parseTourSeen,
  placeCard,
  stepsToShow,
  tourSeenKey,
} from "@/lib/tour";
import { pillAccent, roundIconButton } from "../ui/styles";

// Room around the highlighted element.
const PAD = 6;
const CARD_GUESS = { width: 320, height: 220 };

// The first element marked with one of these anchors that's on screen;
// the sidebar's copies are in the page on phones, but not displayed.
const findAnchor = (names: string[]) => {
  for (const name of names) {
    const match = Array.from(
      document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`),
    ).find((element) => element.getClientRects().length > 0);
    if (match) {
      return match;
    }
  }
  return null;
};

const readSeen = (userId: string) => {
  try {
    return parseTourSeen(localStorage.getItem(tourSeenKey(userId)));
  } catch {
    // Storage blocked: treat it as seen rather than show it every visit.
    return true;
  }
};

const markSeen = (userId: string) => {
  try {
    localStorage.setItem(tourSeenKey(userId), "1");
  } catch {
    // Nothing to do; the tour is closed either way.
  }
};

// Offers the tour once to each signed-in listener, on Home, when no
// other dialog is open (sign-in may still be closing).
const useAutoStart = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const authOpen = useAuthModal((state) => state.isOpen);
  const uploadOpen = useUploadModal((state) => state.isOpen);

  useEffect(() => {
    const blocked = authOpen || uploadOpen || pathname !== "/";
    if (!user || blocked || readSeen(user.id)) {
      return;
    }
    const timer = setTimeout(() => useTour.getState().request(), 800);
    return () => clearTimeout(timer);
  }, [user, pathname, authOpen, uploadOpen]);
};

// Opens a requested tour once Home has rendered, with the steps this
// screen has anchors for.
const useOpenWhenReady = () => {
  const pathname = usePathname();
  const requested = useTour((state) => state.requested);

  useEffect(() => {
    if (!requested || pathname !== "/") {
      return;
    }
    const timer = setTimeout(() => {
      const steps = stepsToShow(TOUR_STEPS, {
        hasAnchor: (name) => findAnchor([name]) !== null,
        finePointer: window.matchMedia("(pointer: fine)").matches,
      });
      useTour.getState().open(steps);
    }, 300);
    return () => clearTimeout(timer);
  }, [requested, pathname]);
};

// Where the current step's element is, kept up to date as the page
// scrolls (including inner scroll areas) or resizes.
const useAnchorRect = (step: TourStep | undefined) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const element = step ? findAnchor(step.anchors) : null;
    element?.scrollIntoView({ block: "nearest" });
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setRect(element ? element.getBoundingClientRect() : null),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (element) {
      observer.observe(element);
    }
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step]);

  return rect;
};

// The card's real size, for placing it.
const useSize = (ref: React.RefObject<HTMLElement | null>, key: string) => {
  const [size, setSize] = useState(CARD_GUESS);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() =>
      setSize({ width: element.offsetWidth, height: element.offsetHeight }),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, key]);

  return size;
};

const padded = (rect: DOMRect) => ({
  top: rect.top - PAD,
  left: rect.left - PAD,
  width: rect.width + PAD * 2,
  height: rect.height + PAD * 2,
});

const centred = {
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

const Spotlight = ({ rect }: { rect: DOMRect | null }) =>
  rect ? (
    <div
      className="absolute rounded-xl ring-2 ring-accent motion-safe:transition-all motion-safe:duration-300"
      style={{
        ...padded(rect),
        boxShadow: "0 0 0 9999px rgb(10 10 10 / 0.72)",
      }}
    />
  ) : (
    <div className="absolute inset-0 bg-canvas/80" />
  );

const Tour = () => {
  useAutoStart();
  useOpenWhenReady();
  const { user } = useUser();
  const { steps, index, go, close } = useTour();
  const step = steps[index];
  const rect = useAnchorRect(step);
  const cardRef = useRef<HTMLDivElement>(null);
  const card = useSize(cardRef, step?.id ?? "");
  const primaryRef = useRef<HTMLButtonElement>(null);

  const finish = () => {
    if (user) {
      markSeen(user.id);
    }
    close();
  };

  if (!step) {
    return null;
  }

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const position = rect
    ? placeCard({
        target: padded(rect),
        card,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      })
    : centred;
  const primaryLabel = isLast ? "Done" : isFirst ? "Show me around" : "Next";

  return (
    <Dialog.Root open onOpenChange={(open) => !open && finish()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60]">
          <Spotlight rect={rect} />
        </Dialog.Overlay>
        <Dialog.Content
          ref={cardRef}
          style={position}
          // Clicks on the page behind don't end the tour by accident.
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            primaryRef.current?.focus();
          }}
          className="fixed z-[61] flex w-[min(320px,calc(100vw-32px))] flex-col gap-y-2 rounded-2xl border border-line bg-surface p-5 shadow-2xl motion-safe:transition-[top,left] motion-safe:duration-300"
        >
          <p className="font-mono text-xs text-muted">
            {index + 1} of {steps.length}
          </p>
          <Dialog.Title className="font-display text-xl font-bold tracking-tight text-fg pr-8">
            {step.title}
          </Dialog.Title>
          <Dialog.Description className="text-[15px] text-muted">
            {step.body}
          </Dialog.Description>
          <div className="mt-3 flex items-center justify-between gap-x-3">
            <button
              type="button"
              onClick={isFirst ? finish : () => go(index - 1)}
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:text-fg"
            >
              {isFirst ? "Skip tour" : "Back"}
            </button>
            <button
              ref={primaryRef}
              type="button"
              onClick={isLast ? finish : () => go(index + 1)}
              className={pillAccent}
            >
              {primaryLabel}
            </button>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Close tour"
              className={`${roundIconButton} absolute top-3 right-3`}
            >
              <IoMdClose size={16} aria-hidden="true" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Tour;
