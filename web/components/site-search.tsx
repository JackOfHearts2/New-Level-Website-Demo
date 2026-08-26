"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { buildSearchIndex, searchIndex, type SearchEntry } from "@/lib/search-index";

// Client ask (2026-08-27): "we don't have a search bar anywhere for the
// website... for any of our sections." A compact expanding trigger (not a
// permanent input) — the nav row is already tight (see the "hidden below
// xl" note on the View Properties button in site-header.tsx), so this
// only claims space once someone actually wants it. Searches the same
// static content every page already renders from (see lib/search-index.ts)
// — services, team, blog categories, FAQ, and the other top-level pages.
export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(() => buildSearchIndex(), []);
  const results = useMemo(() => searchIndex(index, query), [index, query]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onDocumentClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onDocumentClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onDocumentClick);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={open ? "Close search" : "Search the site"}
        aria-expanded={open}
        data-tour="search-site"
        className="text-foreground hover:text-foreground hover:bg-muted flex size-8 items-center justify-center rounded-full transition-colors"
      >
        {open ? <X className="size-4" /> : <Search className="size-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="border-border bg-popover absolute top-full right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-2xl border p-3 shadow-xl"
          >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, team, blog, FAQ…"
              className="border-border bg-background w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            {query.trim() && (
              <div className="mt-2 max-h-80 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-muted-foreground px-1 py-3 text-sm">No matches for &quot;{query}&quot;.</p>
                ) : (
                  <ul className="space-y-0.5">
                    {results.map((r) => (
                      <SearchResultRow key={`${r.group}-${r.href}-${r.title}`} entry={r} onNavigate={close} />
                    ))}
                  </ul>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchResultRow({ entry, onNavigate }: { entry: SearchEntry; onNavigate: () => void }) {
  return (
    <li>
      <Link
        href={entry.href}
        onClick={onNavigate}
        className="hover:bg-muted flex flex-col gap-0.5 rounded-lg px-2 py-2 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-muted-foreground text-[10px] font-semibold tracking-wide uppercase">
            {entry.group}
          </span>
        </span>
        <span className="font-heading text-sm font-semibold">{entry.title}</span>
        <span className="text-muted-foreground truncate text-xs">{entry.description}</span>
      </Link>
    </li>
  );
}
