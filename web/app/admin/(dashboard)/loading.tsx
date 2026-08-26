/** Route-level fallback for every page nested under the (dashboard) group —
 *  Next renders this automatically the instant a navigation to any admin
 *  page starts (App Router's built-in Suspense boundary at this segment),
 *  swapped back out the moment that page's own data has loaded. The
 *  sidebar/topbar in layout.tsx stay mounted throughout; only this content
 *  area flashes in. Client report (2026-08-27): "when you click on
 *  something, it does take you to the page, but that initial click nothing
 *  on the page actually indicates that it worked" — this is the direct
 *  fix, covering every sidebar link, dashboard tile, and notification-bell
 *  link at once rather than wiring a spinner into each one individually. */
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-busy="true" aria-label="Loading">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-border bg-card h-28 rounded-2xl border" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-border bg-card h-24 rounded-2xl border" />
          ))}
        </div>
        <div className="border-border bg-card h-64 rounded-2xl border" />
      </div>
    </div>
  );
}
