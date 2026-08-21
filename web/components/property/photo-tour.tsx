"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Images, ExternalLink } from "lucide-react";
import { TOTAL_PROPERTY_PHOTOS, PROPERTY_ALBUM_URL } from "@/lib/content";
import { PhotoGrid } from "@/components/property/photo-grid";

function photoUrl(idx: number) {
  return `/photos/${String(idx).padStart(2, "0")}.jpg`;
}

const IDLE_MS = 180000;

export function PhotoTour({ children }: { children?: React.ReactNode }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroActive, setHeroActive] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Auto-exit an active tour after 3 idle minutes, same as the old site.
  useEffect(() => {
    if (!heroActive) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setHeroActive(false);
        setHeroIndex(0);
      }, IDLE_MS);
    };
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "wheel",
    ];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [heroActive]);

  // Lightbox keyboard nav + body scroll lock while open.
  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i === null ? i : (i - 1 + TOTAL_PROPERTY_PHOTOS) % TOTAL_PROPERTY_PHOTOS));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => (i === null ? i : (i + 1) % TOTAL_PROPERTY_PHOTOS));
      }
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex]);

  function heroStep(delta: 1 | -1) {
    // First click on either arrow just reveals the tour controls — it
    // doesn't advance yet, matching the old site's heroStep().
    if (!heroActive) {
      setHeroActive(true);
      return;
    }
    setHeroIndex((i) => (i + delta + TOTAL_PROPERTY_PHOTOS) % TOTAL_PROPERTY_PHOTOS);
  }

  return (
    <>
      <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={photoUrl(heroIndex)}
          alt="1331 NW 87th Street"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-28 text-white sm:px-10">
          {children}
        </div>
        <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => heroStep(-1)}
              aria-label="Previous photo"
              className="flex size-10 items-center justify-center rounded-full bg-white/90 text-black hover:bg-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => heroStep(1)}
              aria-label="Next photo"
              className="flex size-10 items-center justify-center rounded-full bg-white/90 text-black hover:bg-white"
            >
              <ChevronRight className="size-4" />
            </button>
            {heroActive && (
              <span className="font-heading rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-black">
                {heroIndex + 1} / {TOTAL_PROPERTY_PHOTOS}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setLightboxIndex(heroIndex)}
            className="font-heading flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-black hover:bg-white"
          >
            <Images className="size-4" />
            View all photos
          </button>
        </div>
      </div>

      <PhotoGrid />

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null);
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
            autoFocus
            className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={() =>
              setLightboxIndex((i) =>
                i === null ? i : (i - 1 + TOTAL_PROPERTY_PHOTOS) % TOTAL_PROPERTY_PHOTOS
              )
            }
            aria-label="Previous photo"
            className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl">
            <Image
              src={photoUrl(lightboxIndex)}
              alt="1331 NW 87th Street"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => setLightboxIndex((i) => (i === null ? i : (i + 1) % TOTAL_PROPERTY_PHOTOS))}
            aria-label="Next photo"
            className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <span className="font-heading rounded-full bg-white/10 px-3 py-1 text-xs text-white">
              {lightboxIndex + 1} / {TOTAL_PROPERTY_PHOTOS}
            </span>
            <a
              href={PROPERTY_ALBUM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-heading flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white hover:bg-white/20"
            >
              View full album
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
