/** Extracted out of about/page.tsx (2026-08-27) so the admin dashboard's
 *  Content & Media preview can render the exact same markup an editor is
 *  about to publish, not an approximation — same reasoning as the
 *  homepage's AboutSection/ServicesSection/etc. */
export function AboutMissionStorySection({ mission, story }: { mission: string; story: string }) {
  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-6 py-16 md:grid-cols-2">
      <div>
        <span className="font-heading text-primary text-sm font-semibold tracking-wide uppercase">
          Our Mission
        </span>
        <p className="text-foreground mt-4 text-lg text-balance">{mission}</p>
      </div>
      <div>
        <span className="font-heading text-primary text-sm font-semibold tracking-wide uppercase">
          Our Story
        </span>
        <p className="text-foreground mt-4 text-balance">{story}</p>
      </div>
    </section>
  );
}
