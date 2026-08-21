"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Carousel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const amount = Math.min(track.clientWidth * 0.9, 480) * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scroll(-1)}
          className="border-border hover:border-primary/50 hover:text-primary flex size-10 items-center justify-center rounded-full border transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scroll(1)}
          className="border-border hover:border-primary/50 hover:text-primary flex size-10 items-center justify-center rounded-full border transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[30%]",
        className
      )}
    >
      {children}
    </div>
  );
}
