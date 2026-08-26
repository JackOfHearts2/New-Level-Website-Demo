import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { CrossNav } from "@/components/cross-nav";
import { getSiteContent } from "@/lib/site-content";
import { getBreadcrumbTrail } from "@/lib/nav-hierarchy";
import { SubscribeForm } from "./subscribe-form";

export const metadata: Metadata = {
  title: "Subscribe · New Level",
};

// Deliberately separate from /contact (see floating-actions.tsx's own
// "unify to one contact surface" fix in Phase 1) — subscribing is a
// different intent than reaching out with a question, so it gets its own
// screen: pick what you want to hear about, optionally create an account.
export default async function SubscribePage() {
  const content = await getSiteContent();
  const page = content.pages.subscribe;

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        heading={page.heading}
        sub={page.sub}
        intro={page.intro}
        breadcrumbs={getBreadcrumbTrail("/subscribe")}
        editKey="subscribe"
      />

      <section className="px-6 pb-24">
        <SubscribeForm />
      </section>

      <CrossNav current="subscribe" />
    </>
  );
}
