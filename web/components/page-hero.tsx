import { ShinePill } from "@/components/ui/shine-shape";

export function PageHero({
  eyebrow,
  heading,
  sub,
  intro,
}: {
  eyebrow: string;
  heading: string;
  sub?: string;
  intro?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-16 text-center sm:pt-40">
      <ShinePill className="bg-accent text-accent-foreground font-heading rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide uppercase">
        {eyebrow}
      </ShinePill>
      <h1 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
        {heading}
      </h1>
      {sub && (
        <p className="text-foreground mt-4 text-lg text-balance">{sub}</p>
      )}
      {intro && (
        <p className="text-foreground mx-auto mt-4 max-w-xl text-balance text-sm">
          {intro}
        </p>
      )}
    </div>
  );
}
