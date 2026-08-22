"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGlowRing } from "@/components/ui/glow-card";
import { CONTACT_TOPICS } from "@/lib/content";

export function ContactTopics({ initialTopic }: { initialTopic?: string }) {
  const [selected, setSelected] = useState(
    CONTACT_TOPICS.some((t) => t.id === initialTopic) ? initialTopic : undefined
  );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {CONTACT_TOPICS.map((topic) => (
        <TopicChip
          key={topic.id}
          label={topic.label}
          selected={selected === topic.id}
          onSelect={() => setSelected(topic.id)}
        />
      ))}
    </div>
  );
}

function TopicChip({
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
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "shine-shape font-heading relative rounded-full border px-4 py-1.5 text-sm font-medium transition-[color,background-color,border-color,transform] duration-300 hover:-translate-y-0.5",
        selected
          ? "bg-primary border-primary text-primary-foreground"
          : "border-border text-foreground hover:border-primary/50 hover:text-foreground"
      )}
    >
      <span className="glow-card__ring" aria-hidden />
      {label}
    </button>
  );
}
