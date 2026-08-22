import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PAGES, RISK_DISCLOSURE_SECTIONS, LEGAL_LAST_UPDATED } from "@/lib/content";

export const metadata: Metadata = {
  title: "Risk Disclosure · New Level",
};

export default function RiskDisclosurePage() {
  const page = PAGES.riskDisclosure;

  return (
    <LegalPage
      eyebrow={page.eyebrow}
      heading={page.heading}
      sub={page.sub}
      lastUpdated={LEGAL_LAST_UPDATED}
      disclaimer="This page explains, in general terms, the kinds of risk that come with real estate investment, ownership, and rental. It's written for this demo and hasn't been reviewed by an attorney or financial professional — it isn't a substitute for independent advice."
      sections={RISK_DISCLOSURE_SECTIONS}
    />
  );
}
