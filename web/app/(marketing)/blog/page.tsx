import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { PAGES, BLOG_CATEGORIES } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

export const metadata: Metadata = {
  title: "Blog · New Level",
};

// "All Articles" overview — each category card links into its own
// dedicated /blog/[category] page (see that route) instead of everything
// funneling into one shared list.
export default function BlogPage() {
  const page = PAGES.blog;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
        breadcrumbs={getBreadcrumbTrail("/blog")}
      />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_CATEGORIES.map((cat) => (
            <GlowCard key={cat.id} href={`/blog/${cat.id}`} className="p-6">
              <h2 className="font-heading text-lg font-semibold">{cat.label}</h2>
              <p className="text-foreground mt-2 text-sm text-balance">{cat.blurb}</p>
              <span className="text-primary font-heading mt-4 inline-block text-sm font-semibold">
                Explore →
              </span>
            </GlowCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-foreground mx-auto max-w-xl text-sm">
            Want to know when the blog launches, or have something you&apos;d
            like us to write about?
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/subscribe">Subscribe for Updates</CtaLink>
          </div>
        </div>
      </section>

      <CrossNav current="blog" />
    </>
  );
}
