import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { PAGES } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";
import { CareersForm } from "./careers-form";

export const metadata: Metadata = {
  title: "Careers · New Level",
};

export default function CareersPage() {
  const page = PAGES.careers;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
        breadcrumbs={getBreadcrumbTrail("/careers")}
      />

      <section className="px-6 pb-24">
        <CareersForm />
      </section>

      <CrossNav current="careers" />
    </>
  );
}
