"use client";

import { useEffect } from "react";
import Link from "next/link";

// Real bug this addresses: without any error.tsx, a client-side exception
// anywhere in a page's tree (a bad Supabase auth cookie left over from
// earlier testing was one confirmed way to trigger this) gets caught by
// Next.js's own default boundary, which renders nothing for that page —
// the nav/footer from the layout above survive, but the page itself goes
// silently, permanently blank until a hard refresh starts fresh. This
// gives that failure a real, recoverable UI instead.
export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-heading text-2xl font-bold">Something didn&apos;t load right.</h1>
      <p className="text-foreground mt-3 text-sm">
        This page hit an unexpected error. Try again, or go back to the homepage.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="font-heading bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl px-6 py-2.5 text-sm font-semibold"
        >
          Try again
        </button>
        <Link
          href="/"
          className="font-heading border-border hover:bg-muted rounded-xl border px-6 py-2.5 text-sm font-semibold"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
