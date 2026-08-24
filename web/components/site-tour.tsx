"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";

const SEEN_KEY = "nlg_tour_seen";
const WELCOME_DELAY_MS = 1500;

type Step = {
  target: string;
  title: string;
  body: string;
};

// Each target is a data-tour attribute set on the actual element elsewhere
// in the app (nav-menu.tsx, profile-menu.tsx, search-box.tsx,
// floating-actions.tsx, and three wrapper divs in app/page.tsx) rather than
// duplicated selectors here, so the tour stays in sync with whatever those
// components actually render.
const STEPS: Step[] = [
  {
    target: '[data-tour="nav"]',
    title: "Explore the menu",
    body: "Properties, About, Services and Blog each open with more specific pages inside — hover or tap to see them.",
  },
  {
    target: '[data-tour="search"]',
    title: "Search for a property",
    body: "Look up listings for sale, for rent, or as an investment — filter by neighborhood, price, and more.",
  },
  {
    target: '[data-tour="account"]',
    title: "Your account",
    body: "Sign in or create an account here to save properties as you browse and choose what you're notified about.",
  },
  {
    target: '[data-tour="services"]',
    title: "What we do",
    body: "Brokerage & consulting, property management, investment, and events — the full New Level lineup.",
  },
  {
    target: '[data-tour="testimonials"]',
    title: "Hear from clients",
    body: "Real feedback from owners, investors, and agents who've worked with us.",
  },
  {
    target: '[data-tour="events"]',
    title: "Hosting an event?",
    body: "See our event-ready venues and packages, from a simple mixer to a fully catered gathering.",
  },
  {
    target: '[data-tour="contact"]',
    title: "Reach us anytime",
    body: "This button stays in the corner wherever you are on the site — chat with us or head straight to Contact.",
  },
];

const MARGIN = 12;
const TOOLTIP_WIDTH = 320;

function usableRect(el: Element | null): DOMRect | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  return rect;
}

export function SiteTour({ startTour }: { startTour: boolean }) {
  const router = useRouter();
  // ?tour=1 starts the tour immediately from this render (no effect
  // needed for that branch — it's known synchronously from the prop).
  const [stepIndex, setStepIndex] = useState<number | null>(startTour ? 0 : null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [, forceTick] = useState(0);

  const start = useCallback(() => setStepIndex(0), []);

  const finish = useCallback(() => {
    setStepIndex(null);
    setShowWelcome(false);
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // localStorage can throw in a private/locked-down browser — the tour
      // just won't remember it was seen, which is a harmless degradation.
    }
    // Drop ?tour=1 from the URL once the tour ends, without a full navigation.
    router.replace("/", { scroll: false });
  }, [router]);

  // A genuine first-time visitor (no ?tour=1) gets a soft prompt instead of
  // the tour launching unannounced.
  useEffect(() => {
    if (startTour) return;
    let seen = true;
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = true; // can't read storage — don't nag every visit
    }
    if (seen) return;
    const id = setTimeout(() => setShowWelcome(true), WELCOME_DELAY_MS);
    return () => clearTimeout(id);
  }, [startTour]);

  const currentStep = stepIndex != null ? STEPS[stepIndex] : null;

  // Finds the current step's target, scrolls it into view, and measures it.
  // Steps whose target doesn't exist or is hidden (e.g. the desktop-only
  // nav dropdown on a phone-width viewport) are skipped automatically
  // rather than spotlighting an invisible element. When there's no current
  // step, this simply does nothing — stale `rect` state is harmless since
  // the render below bails out on `!currentStep` before ever reading it.
  useEffect(() => {
    if (!currentStep) return;
    const el = document.querySelector(currentStep.target);
    const r = usableRect(el);
    if (!r) {
      // Deferred rather than called synchronously here — this still runs
      // effectively immediately, just outside the effect body itself.
      const id = setTimeout(() => {
        if (stepIndex! + 1 < STEPS.length) {
          setStepIndex(stepIndex! + 1);
        } else {
          finish();
        }
      }, 0);
      return () => clearTimeout(id);
    }
    el!.scrollIntoView({ behavior: "auto", block: "center" });
    // Measure on the next frame so the scroll above has settled.
    const raf = requestAnimationFrame(() => setRect(usableRect(el)));
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  // Re-measure on resize/scroll while a step is showing, so the spotlight
  // tracks the target instead of drifting.
  useEffect(() => {
    if (!currentStep) return;
    function remeasure() {
      forceTick((n) => n + 1);
      const el = document.querySelector(currentStep!.target);
      setRect(usableRect(el));
    }
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, { passive: true });
    return () => {
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure);
    };
  }, [currentStep]);

  useEffect(() => {
    if (stepIndex == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [stepIndex, finish]);

  if (showWelcome && stepIndex == null) {
    return (
      // bottom-24/lg:bottom-28: clears FloatingActions' FAB, which shares
      // this same bottom-right corner (lg:right-6/lg:bottom-6, up to
      // size-16) — see floating-actions.tsx's own breakpoint notes.
      <div className="fixed right-4 bottom-24 z-[70] max-w-xs lg:right-6 lg:bottom-28">
        <GlowCard className="p-5 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              setShowWelcome(false);
              try {
                localStorage.setItem(SEEN_KEY, "1");
              } catch {}
            }}
            aria-label="Dismiss"
            className="text-foreground hover:bg-muted absolute top-3 right-3 flex size-6 items-center justify-center rounded-full"
          >
            <X className="size-3.5" />
          </button>
          <h3 className="font-heading pr-6 text-sm font-bold">New here?</h3>
          <p className="text-foreground mt-1.5 text-sm">
            Take a 60-second tour to see where everything is.
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowWelcome(false);
                start();
              }}
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-3 py-1.5 text-sm font-semibold"
            >
              Take the tour
            </button>
            <button
              type="button"
              onClick={() => {
                setShowWelcome(false);
                try {
                  localStorage.setItem(SEEN_KEY, "1");
                } catch {}
              }}
              className="text-foreground hover:bg-muted rounded-lg px-3 py-1.5 text-sm font-semibold"
            >
              No thanks
            </button>
          </div>
        </GlowCard>
      </div>
    );
  }

  if (!currentStep || !rect) return null;

  const spaceBelow = window.innerHeight - rect.bottom;
  const placeAbove = spaceBelow < 220 && rect.top > 220;
  const top = placeAbove ? Math.max(MARGIN, rect.top - MARGIN) : rect.bottom + MARGIN;
  const idealLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
  const left = Math.min(
    Math.max(idealLeft, MARGIN),
    window.innerWidth - TOOLTIP_WIDTH - MARGIN
  );

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Spotlight: a transparent box the size of the target, whose huge
          box-shadow darkens everything else on the page — avoids a
          clip-path/mask (which would need vendor handling for the rounded
          highlight ring below) for the same visual effect. */}
      <div
        aria-hidden
        onClick={finish}
        className="absolute rounded-xl ring-2 ring-primary transition-[top,left,width,height] duration-200"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
        }}
      />

      <div
        className="absolute"
        style={{
          top: placeAbove ? undefined : top,
          bottom: placeAbove ? window.innerHeight - top : undefined,
          left,
          width: TOOLTIP_WIDTH,
        }}
      >
        <GlowCard className="p-5 shadow-2xl">
          <button
            type="button"
            onClick={finish}
            aria-label="Close tour"
            className="text-foreground hover:bg-muted absolute top-3 right-3 flex size-6 items-center justify-center rounded-full"
          >
            <X className="size-3.5" />
          </button>
          <p className="text-foreground text-xs font-semibold tracking-wide uppercase">
            Step {stepIndex! + 1} of {STEPS.length}
          </p>
          <h3 className="font-heading mt-1 pr-6 text-sm font-bold">{currentStep.title}</h3>
          <p className="text-foreground mt-1.5 text-sm">{currentStep.body}</p>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.max(0, (i ?? 0) - 1))}
              disabled={stepIndex === 0}
              className="text-foreground font-heading text-sm font-semibold hover:underline disabled:opacity-0"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (stepIndex! + 1 >= STEPS.length) {
                  finish();
                } else {
                  setStepIndex((i) => (i ?? 0) + 1);
                }
              }}
              className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-4 py-1.5 text-sm font-semibold"
            >
              {stepIndex! + 1 >= STEPS.length ? "Done" : "Next"}
            </button>
          </div>
        </GlowCard>
      </div>
    </div>
  );
}
