"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SWIPE_OFFSET = 60;
const SWIPE_VELOCITY = 400;

function swipeDirection(info: PanInfo): -1 | 0 | 1 {
  if (info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY) return 1;
  if (info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY) return -1;
  return 0;
}

// An asymmetric bento arrangement instead of the usual uniform thumbnail
// strip — alternating large/small tiles so the photo section itself has
// some composition to it, not just a scrollable row of same-size crops.
const TILES = [
  { photo: "00", span: "md:col-span-2" },
  { photo: "04", span: "" },
  { photo: "05", span: "" },
  { photo: "01", span: "md:col-span-2" },
  { photo: "14", span: "" },
  { photo: "20", span: "" },
];

export function PhotoGrid() {
  const [selected, setSelected] = useState<number | null>(null);

  function step(delta: 1 | -1) {
    setSelected((i) => (i === null ? i : (i + delta + TILES.length) % TILES.length));
  }

  useEffect(() => {
    if (selected === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-4 md:grid-cols-3">
      {TILES.map((tile, i) => (
        <motion.button
          key={tile.photo}
          type="button"
          layoutId={`photo-grid-${tile.photo}`}
          onClick={() => setSelected(i)}
          className={cn(
            "relative aspect-4/3 overflow-hidden rounded-2xl border-border border",
            tile.span
          )}
        >
          <Image
            src={`/photos/${tile.photo}.jpg`}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </motion.button>
      ))}

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="size-5" />
            </button>
            <motion.div
              layoutId={`photo-grid-${TILES[selected].photo}`}
              className="relative aspect-4/3 w-full max-w-3xl touch-pan-y overflow-hidden rounded-2xl"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                const dir = swipeDirection(info);
                if (dir !== 0) step(dir);
              }}
            >
              <Image
                src={`/photos/${TILES[selected].photo}.jpg`}
                alt=""
                fill
                sizes="100vw"
                className="pointer-events-none object-cover"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronRight className="size-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
