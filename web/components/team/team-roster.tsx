"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { GlowCard } from "@/components/ui/glow-card";
import { ShinePill } from "@/components/ui/shine-shape";
import { cn } from "@/lib/utils";
import type { TEAM } from "@/lib/content";

// The full /team page needed to read as genuinely different from the
// homepage's image-accordion strip (client feedback: "it just takes us to
// a page that basically looks the same as what we had before"), while
// still using the site's existing card language rather than inventing a
// new visual system. This alternates image-left/text-right, then
// image-right/text-left, all the way down — same GlowCard treatment
// (border, cursor-glow ring on hover) as everywhere else, just composed as
// a stacked row instead of a grid. Clicking anywhere on a row — the photo
// or the "Learn more" affordance — goes to that person's own bio page at
// /team/[slug]; the whole row IS the link (GlowCard href), so "Learn more"
// is a plain span, not a second nested anchor.
export function TeamRoster({ team }: Readonly<{ team: typeof TEAM }>) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pb-24 sm:gap-14">
      {team.map((member, i) => {
        const reversed = i % 2 === 1;
        return (
          <motion.div
            key={member.slug}
            initial={reduceMotion ? undefined : { opacity: 0, x: reversed ? 40 : -40 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          >
            <GlowCard
              href={`/team/${member.slug}`}
              className="group grid overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:grid-cols-2"
            >
              <div
                className={cn(
                  "relative aspect-4/3 overflow-hidden md:aspect-auto md:min-h-[420px]",
                  reversed && "md:order-2"
                )}
              >
                <Image
                  src={member.photo}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className={cn(
                    "object-cover transition-transform duration-500 ease-out group-hover:scale-105",
                    member.photoPosition === "top" && "object-top"
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent md:hidden" />
              </div>

              <div
                className={cn(
                  "flex flex-col justify-center gap-4 p-8 sm:p-10 md:p-14",
                  reversed && "md:order-1"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase">
                    {member.role}
                  </ShinePill>
                  {member.placeholder && (
                    <span className="border-border text-foreground rounded-full border px-3 py-1 text-xs font-medium">
                      Placeholder profile
                    </span>
                  )}
                </div>

                <h3 className="font-heading text-3xl font-bold text-balance md:text-4xl">
                  {member.name}
                </h3>

                <div className="relative pl-8">
                  <Quote
                    className="text-primary/25 absolute top-0 left-0 size-6"
                    aria-hidden
                  />
                  <p className="font-heading text-lg italic text-balance">
                    {member.quote}
                  </p>
                </div>

                <p className="text-foreground text-sm">{member.bio}</p>

                <span className="font-heading text-primary mt-2 inline-flex w-fit items-center gap-2 text-sm font-semibold">
                  Learn more
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </div>
            </GlowCard>
          </motion.div>
        );
      })}
    </div>
  );
}
