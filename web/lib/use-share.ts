"use client";

import { useState } from "react";

// Native share sheet where available (mobile, some desktop browsers),
// falling back to copying the link — shared by the compact card-corner
// icons and the full-text button on the property page itself.
export function useShare(url: string, title: string) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the native share sheet — nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be unavailable (older browser, non-HTTPS) —
      // fail silently rather than throwing in front of the visitor.
    }
  }

  return { share, copied };
}
