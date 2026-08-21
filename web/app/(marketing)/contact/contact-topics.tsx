"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CONTACT_TOPICS } from "@/lib/content";

export function ContactTopics({ initialTopic }: { initialTopic?: string }) {
  const [selected, setSelected] = useState(
    CONTACT_TOPICS.some((t) => t.id === initialTopic) ? initialTopic : undefined
  );

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {CONTACT_TOPICS.map((topic) => (
        <button
          key={topic.id}
          type="button"
          onClick={() => setSelected(topic.id)}
          aria-pressed={selected === topic.id}
          className={cn(
            "font-heading rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            selected === topic.id
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          )}
        >
          {topic.label}
        </button>
      ))}
    </div>
  );
}
