import Image from "next/image";
import { GlowCard } from "@/components/ui/glow-card";

type Testimonial = { name: string; role: string; text: string; photo: string };

// Adapted from a "profile card" testimonial reference the client shared —
// same big-photo + card layout, but no arrow pagination: every testimonial
// renders as its own card, stacked one under the next, per the client's
// explicit instruction to drop the carousel paging on this page.
export function TestimonialProfileStack({
  testimonials,
}: Readonly<{ testimonials: Testimonial[] }>) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      {testimonials.map((t) => (
        <div key={t.name} className="flex flex-col items-center md:flex-row">
          <div className="bg-muted h-72 w-72 shrink-0 overflow-hidden rounded-3xl md:h-[22rem] md:w-[22rem]">
            <Image
              src={t.photo}
              alt=""
              width={352}
              height={352}
              className="h-full w-full object-cover"
            />
          </div>
          <GlowCard className="relative z-10 -mt-6 w-full max-w-xl p-8 md:-ml-16 md:mt-0">
            <h2 className="font-heading text-2xl font-bold">{t.name}</h2>
            <p className="text-foreground mt-1 text-sm font-medium">{t.role}</p>
            <p className="text-foreground mt-6 text-base leading-relaxed text-balance">
              &ldquo;{t.text}&rdquo;
            </p>
          </GlowCard>
        </div>
      ))}
    </div>
  );
}
