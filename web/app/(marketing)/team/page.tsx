import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import { GlowCard } from "@/components/ui/glow-card";
import { cn } from "@/lib/utils";
import { PAGES, TEAM } from "@/lib/content";

export const metadata: Metadata = {
  title: "Agents & Partners · New Level",
};

export default function TeamPage() {
  const page = PAGES.team;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
      />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Carousel>
          {TEAM.map((member, i) => (
            <CarouselItem key={i}>
              <GlowCard className="h-full p-6 text-center">
                <div
                  className={cn(
                    "font-heading mx-auto flex size-16 items-center justify-center rounded-full text-xl font-bold",
                    member.placeholder
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground"
                  )}
                >
                  {member.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <h3 className="font-heading mt-4 font-semibold">{member.name}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{member.role}</p>
                <p className="text-muted-foreground/80 mt-3 text-xs italic">
                  &ldquo;{member.motto}&rdquo;
                </p>
              </GlowCard>
            </CarouselItem>
          ))}
        </Carousel>
      </section>

      <CrossNav current="team" />
    </>
  );
}
