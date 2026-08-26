"use client";

import { X } from "lucide-react";

/** Scoped version of SitePreview (components/site-preview.tsx) — shows
 *  just the one section an editor is currently working on, not the whole
 *  homepage, since re-checking the entire page for a one-field change is
 *  redundant. Client ask (2026-08-26): "not necessarily the whole website
 *  because that's redundant... just a section that they're about to
 *  update." pointer-events-none on the rendered content since real
 *  section components carry real links/buttons that shouldn't be
 *  clickable from inside a preview modal. */
export function SectionPreview({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* max-w-7xl (not a narrower modal width) — the live page's own
          sections are max-w-7xl containers; previewing at a narrower width
          reflows text at different line-break points than production,
          which reads as "formatting broke" when it's really just a
          preview-fidelity mismatch (client report, 2026-08-26: a word
          wrapping to its own line in preview that doesn't on the live
          page). */}
      <div className="bg-background max-h-[85vh] w-full max-w-7xl overflow-hidden rounded-2xl shadow-2xl">
        <div className="bg-foreground text-background flex items-center justify-between gap-4 px-6 py-3">
          <p className="font-heading text-sm font-semibold">Preview — {title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="hover:bg-background/20 flex size-8 items-center justify-center rounded-full"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[calc(85vh-52px)] overflow-y-auto">
          <div className="pointer-events-none">{children}</div>
        </div>
      </div>
    </div>
  );
}
