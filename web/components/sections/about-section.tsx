import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { NLG_BRAND, TRUST_STATS } from "@/lib/content";

export function AboutSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            About New Level
          </span>
          <h2 className="font-heading mt-6 max-w-lg text-4xl font-bold text-balance md:text-5xl">
            Real estate, redefined at every level.
          </h2>
          <p className="text-muted-foreground mt-6 max-w-lg text-lg text-balance">
            {NLG_BRAND.aboutShort}
          </p>
          <Link
            href="/about"
            className={cn(
              buttonVariants({ size: "lg" }),
              "font-heading mt-8 rounded-xl px-6 font-semibold"
            )}
          >
            Learn about New Level
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="border-border rounded-2xl border p-6 shadow-sm"
            >
              <div className="font-heading text-primary text-3xl font-bold md:text-4xl">
                {stat.value}
              </div>
              <div className="text-muted-foreground mt-2 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-muted-foreground/70 mt-4 text-right text-xs">
        Figures shown are illustrative placeholders for this demo.
      </p>
    </section>
  );
}
