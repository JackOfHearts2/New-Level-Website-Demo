import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { GlowCard } from "@/components/ui/glow-card";
import { CtaLink } from "@/components/ui/cta-link";
import { ShineListItem } from "@/components/ui/shine-shape";
import { BLOG_CATEGORIES } from "@/lib/content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";

function getCategory(id: string) {
  return BLOG_CATEGORIES.find((c) => c.id === id);
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  return { title: cat ? `${cat.label} · Blog · New Level` : "Blog · New Level" };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const otherCategories = BLOG_CATEGORIES.filter((c) => c.id !== cat.id);

  return (
    <>
      <PageHero
        eyebrow="Blog"
        heading={cat.label}
        sub={cat.blurb}
        breadcrumbs={getBreadcrumbTrail(`/blog/${category}`)}
      />

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <GlowCard className="p-8">
          <h2 className="font-heading text-lg font-semibold">Why this category matters</h2>
          <p className="text-foreground mt-3 text-balance">{cat.whyItMatters}</p>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="font-heading text-lg font-semibold">What we&apos;ll cover here</h2>
        <ul className="mt-4 space-y-3">
          {cat.topics.map((topic) => (
            <ShineListItem key={topic} className="border-border rounded-xl border p-4 text-sm">
              {topic}
            </ShineListItem>
          ))}
        </ul>
        <p className="text-foreground mt-6 text-sm italic">
          No posts are published in this category yet — this is a preview of what&apos;s coming,
          not a list of existing articles.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16 text-center">
        <GlowCard className="p-8">
          <h2 className="font-heading text-xl font-semibold">Don&apos;t want to miss it?</h2>
          <p className="text-foreground mt-2 text-sm">
            Subscribe and we&apos;ll let you know as soon as {cat.label.toLowerCase()} content
            goes live.
          </p>
          <div className="mt-6 flex justify-center">
            <CtaLink href="/subscribe">Subscribe for Updates</CtaLink>
          </div>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="font-heading text-center text-lg font-semibold">Other categories</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {otherCategories.map((c) => (
            <GlowCard key={c.id} href={`/blog/${c.id}`} className="px-5 py-2.5">
              <span className="font-heading text-sm font-semibold">{c.label}</span>
            </GlowCard>
          ))}
        </div>
      </section>

      <CrossNav current="blog" />
    </>
  );
}
