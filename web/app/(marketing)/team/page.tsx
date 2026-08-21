import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { TeamFolderReveal } from "@/components/team/team-folder-reveal";
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
        <TeamFolderReveal team={TEAM} />
      </section>

      <CrossNav current="team" />
    </>
  );
}
