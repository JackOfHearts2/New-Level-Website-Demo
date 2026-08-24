// Shown automatically by Next.js while a route segment's data is loading
// (both a fresh page load and a client-side navigation between pages) —
// previously nothing rendered in that gap, which on a slower connection
// read as "the page is blank until I refresh." Plain CSS, no client-side
// JS or image fetch, so it paints immediately rather than adding its own
// loading delay.
export default function Loading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div
        aria-label="Loading"
        role="status"
        className="border-muted border-t-primary size-10 animate-spin rounded-full border-4"
      />
    </div>
  );
}
