"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FolderStack } from "@/components/team/folder-stack";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import type { TEAM } from "@/lib/content";

export function TeamFolderReveal({ team }: { team: typeof TEAM }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <AnimatePresence mode="wait">
        {!open && (
          <motion.div
            key="closed"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <FolderStack team={team} />
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => setOpen(true)}>
                <HoverBorderGradient as="div" className="font-heading font-semibold">
                  Meet the whole team
                </HoverBorderGradient>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="mx-auto max-w-4xl space-y-16">
          {team.map((member, i) => {
            const imageOnRight = i % 2 === 1;
            return (
              <motion.div
                key={member.name + i}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                  delay: reduceMotion ? 0 : i * 0.1,
                  ease: "easeOut",
                }}
                className={cn(
                  "flex flex-col items-center gap-8 sm:gap-10 md:flex-row",
                  imageOnRight && "md:flex-row-reverse"
                )}
              >
                <div className="relative aspect-4/5 w-full max-w-xs shrink-0 overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src={member.photo}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 320px, 80vw"
                    className="object-cover"
                  />
                </div>
                <div className={cn("text-center md:text-left", imageOnRight && "md:text-right")}>
                  <h3 className="font-heading text-2xl font-bold">{member.name}</h3>
                  <p className="text-primary mt-1 font-heading text-sm font-semibold">
                    {member.role}
                  </p>
                  <p className="text-muted-foreground mt-4 text-balance">
                    &ldquo;{member.motto}&rdquo;
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
