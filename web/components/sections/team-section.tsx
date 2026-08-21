import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { TEAM } from "@/lib/content";

export function TeamSection({ team }: { team: typeof TEAM }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
            Agents & Partners
          </span>
          <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
            Our Team
          </h2>
        </div>
        <Link
          href="/team"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "font-heading rounded-xl px-6 font-semibold"
          )}
        >
          Meet the full team
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((member, i) => (
          <div
            key={i}
            className="border-border rounded-2xl border p-6 text-center shadow-sm"
          >
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
            <p className="text-muted-foreground mt-1 text-sm">
              {member.role}
            </p>
            <p className="text-muted-foreground/80 mt-3 text-xs italic">
              &ldquo;{member.motto}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
