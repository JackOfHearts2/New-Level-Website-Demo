"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef } from "react";
import { CtaLink } from "@/components/ui/cta-link";

interface VerticalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
}

function VerticalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 30,
}: Readonly<VerticalMarqueeProps>) {
  return (
    <div
      className={cn("group flex flex-col overflow-hidden", className)}
      style={{ "--duration": `${speed}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "animate-marquee-vertical flex shrink-0 flex-col",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "animate-marquee-vertical flex shrink-0 flex-col",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

// Real New Level service lines, not invented copy — the same set rendered
// on Services/About, just reformatted for a one-line marquee.
const MARQUEE_ITEMS = [
  "Brokerage & Consulting",
  "Property Management",
  "Investment Strategy",
  "Private Events",
  "Portfolio Growth",
  "Client Partnerships",
];

export function CtaWithTextMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Fades each marquee line based on distance from the vertical center —
  // the closer to center, the more opaque — same effect as the reference.
  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;

    let frame: number;
    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll<HTMLElement>(".marquee-item");
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const maxDistance = containerRect.height / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        item.style.opacity = (1 - normalizedDistance * 0.75).toString();
      });
      frame = requestAnimationFrame(updateOpacity);
    };

    frame = requestAnimationFrame(updateOpacity);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="bg-background text-foreground flex items-center justify-center overflow-hidden px-6 py-24">
      <div className="w-full max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <div className="max-w-xl space-y-8">
            <h2 className="font-heading text-5xl leading-tight font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
              Ready for your next move?
            </h2>
            <p className="text-foreground text-lg leading-relaxed md:text-xl">
              Whether you&apos;re buying, investing, managing a portfolio, or
              planning something worth celebrating, New Level is ready when
              you are.
            </p>
            <div className="flex flex-wrap gap-4">
              <CtaLink href="/contact">Contact Us</CtaLink>
              <CtaLink href="/subscribe" variant="light">
                Subscribe to Updates
              </CtaLink>
            </div>
          </div>

          <div
            ref={marqueeRef}
            className="relative flex h-[420px] items-center justify-center lg:h-[520px]"
          >
            <div className="relative h-full w-full">
              <VerticalMarquee speed={20} className="h-full">
                {MARQUEE_ITEMS.map((item) => (
                  <div
                    key={item}
                    className="marquee-item font-heading py-8 text-3xl leading-tight font-light tracking-tight text-balance md:text-4xl lg:text-5xl"
                  >
                    {item}
                  </div>
                ))}
              </VerticalMarquee>

              <div className="from-background via-background/50 pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b to-transparent" />
              <div className="from-background via-background/50 pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
