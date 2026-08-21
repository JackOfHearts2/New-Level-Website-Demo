import Link from "next/link";
import type { TEAM } from "@/lib/content";
import { FolderStack } from "@/components/team/folder-stack";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function TeamSection({ team }: { team: typeof TEAM }) {
  return (
    <section className="mx-auto w-full min-w-0 max-w-7xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="bg-accent text-accent-foreground font-heading inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
          Agents & Partners
        </span>
        <h2 className="font-heading mt-6 text-4xl font-bold text-balance md:text-5xl">
          Our Team
        </h2>
      </div>

      <FolderStack team={team} />

      <div className="mt-8 flex justify-center">
        <Link href="/team">
          <HoverBorderGradient as="div" className="font-heading font-semibold">
            Meet the full team
          </HoverBorderGradient>
        </Link>
      </div>
    </section>
  );
}
