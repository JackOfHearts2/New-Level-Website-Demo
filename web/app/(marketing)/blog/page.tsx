import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { cn } from "@/lib/utils";
import { PAGES, BLOG_CATEGORIES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog · New Level",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const page = PAGES.blog;
  const { category } = await searchParams;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
      />

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_CATEGORIES.map((cat) => (
            <GlowCard
              key={cat.id}
              id={cat.id}
              className={cn(
                "scroll-mt-32 p-6",
                category === cat.id && "border-primary bg-accent"
              )}
            >
              <h2 className="font-heading text-lg font-semibold">{cat.label}</h2>
              <p className="text-foreground mt-2 text-sm text-balance">{cat.blurb}</p>
              <p className="text-foreground mt-4 text-sm italic">
                No posts published yet.
              </p>
            </GlowCard>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-foreground mx-auto max-w-xl text-sm">
            Want to know when the blog launches, or have something you&apos;d
            like us to write about?
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/contact">Get in Touch</CtaLink>
          </div>
        </div>
      </section>

      <CrossNav current="blog" />
    </>
  );
}
