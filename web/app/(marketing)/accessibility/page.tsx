import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PAGES, ACCESSIBILITY_SECTIONS, LEGAL_LAST_UPDATED } from "@/lib/content";

export const metadata: Metadata = {
  title: "Accessibility Statement · New Level",
};

export default function AccessibilityPage() {
  const page = PAGES.accessibility;

  return (
    <LegalPage
      eyebrow={page.eyebrow}
      heading={page.heading}
      sub={page.sub}
      lastUpdated={LEGAL_LAST_UPDATED}
      disclaimer="This statement reflects New Level's stated commitment to accessibility. A full WCAG audit hasn't been completed yet — a real brokerage should have this reviewed before publishing it live."
      sections={ACCESSIBILITY_SECTIONS}
    />
  );
}
