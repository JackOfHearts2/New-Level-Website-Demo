import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { ContentLibraryGrid } from "@/components/content-library-grid";
import { SOCIAL_ICONS } from "@/components/social-icons";
import { SOCIALS } from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "Content Library · New Level",
};

export default async function ContentLibraryPage() {
  const content = await getSiteContent();
  const page = content.pages.contentLibrary;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
        breadcrumbs={getBreadcrumbTrail("/content-library")}
        editKey="contentLibrary"
      />

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="flex flex-wrap justify-center gap-3">
          {SOCIALS.map((s) => {
            const Icon = SOCIAL_ICONS[s.id];
            return (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="border-border hover:border-primary/50 hover:-translate-y-1 flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300"
              >
                {Icon && <Icon className="size-4" />}
                <span className="font-heading">Follow on {s.name}</span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <ContentLibraryGrid />
      </section>

      <CrossNav current="contentLibrary" />
    </>
  );
}
