/** Extracted out of brokers-corner/page.tsx (2026-08-27) so the admin
 *  dashboard's Content & Media preview can render the exact same markup
 *  an editor is about to publish, not an approximation — same reasoning
 *  as AboutMissionStorySection/AboutValuesSection/PartnersGrid. */
export function BrokersCornerIntroSection({
  tagline,
  intro,
  bio,
}: {
  tagline: string;
  intro: string;
  bio: string;
}) {
  return (
    <section className="mx-auto max-w-3xl px-6 pb-8 text-center">
      <p className="text-primary font-heading text-sm font-semibold tracking-wide uppercase">
        {tagline}
      </p>
      <p className="text-foreground mt-4 text-balance">{intro}</p>
      <p className="text-foreground mt-4 text-balance">{bio}</p>
    </section>
  );
}
