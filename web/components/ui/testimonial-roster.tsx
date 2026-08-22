"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { cn } from "@/lib/utils";

type Testimonial = { name: string; role: string; text: string; photo: string };

// The dedicated /testimonials page used to be a plain repeated stack — same
// image-left/card-right pairing for every entry, no real design intent of
// its own. Reworked with the same alternating-row treatment the /team page
// got (see team-roster.tsx): photo left/text right, then flipped, all the
// way down, plus an oversized index numeral and quote mark per row for a
// bolder editorial feel. No per-testimonial pages here — these aren't
// clickable, just laid out with more intention than a flat repeat.
export function TestimonialRoster({
  testimonials,
}: Readonly<{ testimonials: Testimonial[] }>) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:gap-14">
      {testimonials.map((t, i) => {
        const reversed = i % 2 === 1;
        return (
          <motion.div
            key={t.name}
            initial={reduceMotion ? undefined : { opacity: 0, x: reversed ? 40 : -40 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          >
            <GlowCard className="grid overflow-hidden p-0 md:grid-cols-2">
              <div
                className={cn(
                  "relative aspect-4/3 overflow-hidden md:aspect-auto md:min-h-[380px]",
                  reversed && "md:order-2"
                )}
              >
                <Image
                  src={t.photo}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div
                className={cn(
                  "relative flex flex-col justify-center gap-4 p-8 sm:p-10 md:p-14",
                  reversed && "md:order-1"
                )}
              >
                <span
                  aria-hidden
                  className="font-heading text-border pointer-events-none absolute top-2 right-6 text-[7rem] leading-none font-bold select-none sm:text-[9rem]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <Quote className="text-primary/30 relative size-8" aria-hidden />
                <p className="font-heading relative text-xl italic text-balance sm:text-2xl">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="relative mt-2 border-t border-border pt-4">
                  <div className="font-heading font-semibold">{t.name}</div>
                  <div className="text-foreground text-sm">{t.role}</div>
                </div>
              </div>
            </GlowCard>
          </motion.div>
        );
      })}
    </div>
  );
}
