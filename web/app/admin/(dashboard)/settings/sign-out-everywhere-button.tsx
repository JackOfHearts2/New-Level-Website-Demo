"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOutEverywhere } from "./actions";

export function SignOutEverywhereButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick() {
    if (!confirm("This signs out every device, including this one — you'll need to log back in. Continue?")) {
      return;
    }
    startTransition(async () => {
      const result = await signOutEverywhere();
      if (result?.error) {
        setError(result.error);
        return;
      }
      // Global sign-out revokes this session too — it's not just "the
      // other devices," so send them to sign back in rather than leaving
      // the page looking normal while the session underneath it is dead.
      router.push("/?signin=1");
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="font-heading border-border rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50"
      >
        {isPending ? "Signing out…" : "Sign out everywhere"}
      </button>
      {error && (
        <p className="text-destructive mt-1 text-xs" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
