import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PAGES, TERMS_SECTIONS, LEGAL_LAST_UPDATED } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Use · New Level",
};

export default function TermsPage() {
  const page = PAGES.terms;

  return (
    <LegalPage
      eyebrow={page.eyebrow}
      heading={page.heading}
      sub={page.sub}
      lastUpdated={LEGAL_LAST_UPDATED}
      disclaimer="These terms describe how this demo site is meant to be used today. They haven't been reviewed by an attorney and shouldn't be treated as a finished legal document once real bookings, accounts, or payments are connected."
      sections={TERMS_SECTIONS}
    />
  );
}
