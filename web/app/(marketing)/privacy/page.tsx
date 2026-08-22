import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PAGES, PRIVACY_SECTIONS, LEGAL_LAST_UPDATED } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy · New Level",
};

export default function PrivacyPage() {
  const page = PAGES.privacy;

  return (
    <LegalPage
      eyebrow={page.eyebrow}
      heading={page.heading}
      sub={page.sub}
      lastUpdated={LEGAL_LAST_UPDATED}
      disclaimer="The policy below describes, accurately, what this specific site actually does with information today — it hasn't been reviewed by an attorney and shouldn't be treated as a finished legal document once real data collection (live forms, accounts, analytics) is connected."
      sections={PRIVACY_SECTIONS}
    />
  );
}
