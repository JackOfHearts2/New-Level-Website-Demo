/** Keyboard-only accessibility feature: invisible until focused (Tab from
 *  the top of the page), then jumps past the nav straight to #main-content.
 *  Referenced as a real, already-shipped feature in the Accessibility
 *  statement (/accessibility) — see web/lib/content.ts. Needs to be the
 *  very first element on every page, before the nav, for the browser's
 *  natural Tab order to reach it first. */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="bg-primary text-primary-foreground font-heading sr-only rounded-lg px-4 py-2 text-sm font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
    >
      Skip to content
    </a>
  );
}
