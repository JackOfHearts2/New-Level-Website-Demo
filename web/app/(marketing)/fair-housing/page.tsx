import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PAGES, FAIR_HOUSING_SECTIONS, LEGAL_LAST_UPDATED } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fair Housing Statement · New Level",
};

export default function FairHousingPage() {
  const page = PAGES.fairHousing;

  return (
    <LegalPage
      eyebrow={page.eyebrow}
      heading={page.heading}
      sub={page.sub}
      lastUpdated={LEGAL_LAST_UPDATED}
      disclaimer="This statement reflects New Level's stated commitment to equal housing opportunity. It hasn't been reviewed by an attorney; a real brokerage should confirm this language against current federal, state, and local fair housing requirements before publishing it live."
      sections={FAIR_HOUSING_SECTIONS}
    />
  );
}
