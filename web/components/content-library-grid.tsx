"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CONTENT_LIBRARY_POSTS, SOCIALS } from "@/lib/content";
import { SOCIAL_ICONS } from "@/components/social-icons";
import { GlowCard, useGlowRing } from "@/components/ui/glow-card";
import { ShineCircle, ShinePill } from "@/components/ui/shine-shape";

const FILTERS = [
  { id: "all", label: "All" },
  ...SOCIALS.map((s) => ({ id: s.id, label: s.name })),
];

export function ContentLibraryGrid() {
  const [active, setActive] = useState("all");
  const posts =
    active === "all"
      ? CONTENT_LIBRARY_POSTS
      : CONTENT_LIBRARY_POSTS.filter((p) => p.platform === active);

  return (
    <div>
      <div role="tablist" className="flex flex-wrap justify-center gap-2">
        {FILTERS.map((f) => (
          <LibraryTab
            key={f.id}
            label={f.label}
            selected={active === f.id}
            onSelect={() => setActive(f.id)}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post, i) => {
          const social = SOCIALS.find((s) => s.id === post.platform);
          const Icon = SOCIAL_ICONS[post.platform];
          return (
            <GlowCard
              key={i}
              href={social?.href ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="group hover:-translate-y-1 block overflow-hidden p-0 transition-transform duration-300"
            >
              <div className="relative aspect-square">
                <Image
                  src={`/photos/${post.photo}.jpg`}
                  alt={post.caption}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <ShineCircle className="bg-background/90 text-foreground absolute top-3 left-3 flex size-8 items-center justify-center rounded-full">
                  {Icon && <Icon className="size-4" />}
                </ShineCircle>
                <ShinePill className="font-heading bg-background/90 text-muted-foreground absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-semibold uppercase">
                  Example
                </ShinePill>
              </div>
              <div className="p-4">
                <p className="text-sm">{post.caption}</p>
              </div>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}

function LibraryTab({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useGlowRing<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "shine-shape font-heading relative rounded-full px-4 py-2 text-sm font-semibold transition-[color,background-color,transform] duration-300 hover:-translate-y-0.5",
        selected ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {label}
    </button>
  );
}
