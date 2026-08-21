"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// An asymmetric bento arrangement instead of the usual uniform thumbnail
// strip — alternating large/small tiles so the photo section itself has
// some composition to it, not just a scrollable row of same-size crops.
const TILES = [
  { photo: "00", span: "md:col-span-2" },
  { photo: "09", span: "" },
  { photo: "11", span: "" },
  { photo: "06", span: "md:col-span-2" },
  { photo: "24", span: "" },
  { photo: "34", span: "" },
];

export function PhotoGrid() {
  const [selected, setSelected] = useState<number | null>(null);

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
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <motion.div
              layoutId={`photo-grid-${TILES[selected].photo}`}
              className="relative aspect-4/3 w-full max-w-3xl overflow-hidden rounded-2xl"
            >
              <Image
                src={`/photos/${TILES[selected].photo}.jpg`}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
