import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { TeamRoster } from "@/components/team/team-roster";
import { PAGES, TEAM } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

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
        breadcrumbs={getBreadcrumbTrail("/team")}
      />

      <TeamRoster team={TEAM} />

      <CrossNav current="team" />
    </>
  );
}
