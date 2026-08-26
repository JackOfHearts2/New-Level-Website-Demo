import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { TeamRoster } from "@/components/team/team-roster";
import { getSiteContent } from "@/lib/site-content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "Agents & Partners · New Level",
};

export default async function TeamPage() {
  const content = await getSiteContent();
  const page = content.pages.team;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
        breadcrumbs={getBreadcrumbTrail("/team")}
        editKey="team"
      />

      <TeamRoster team={content.team} />

      <CrossNav current="team" />
    </>
  );
}
