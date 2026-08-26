"use client";

import { createContext, useContext, useState } from "react";
import type { getSiteContent } from "@/lib/site-content";
import { useProfileRole } from "@/lib/supabase/use-profile-role";

// The RESOLVED content shape (images already turned into fetchable URLs) —
// matches exactly what (marketing)/layout.tsx and app/page.tsx already
// fetch and pass down elsewhere, so there's no separate fetch needed here.
// contentToFormData() (site-content-form.ts) only reads the text fields,
// never `.images`, so the resolved-vs-raw images shape difference doesn't
// matter for what this context is actually used for.
export type EditableContent = Awaited<ReturnType<typeof getSiteContent>>;

type EditModeValue = {
  on: boolean;
  isAdmin: boolean;
  toggle: () => void;
  content: EditableContent | null;
  /** Called after a field saves successfully so the NEXT inline edit's
   *  contentToFormData() snapshot includes this change too, rather than
   *  building from the stale server-fetched content on every save. */
  updateField: (name: string, value: string) => void;
};

// A real default (not null) — critically, this means any component using
// InlineEditable/useEditMode() renders SAFELY even with no
// <EditModeProvider> ancestor, just permanently in the "not editable"
// state (on: false). This was a real, shipped bug: AboutSection/
// EventCtaSection (which use InlineEditable) get rendered inside the
// admin dashboard's own preview modals (SectionPreview, SitePreview, both
// reachable from /admin/content) — those admin pages were never wrapped
// in EditModeProvider (only the public marketing layout/homepage are),
// so useEditMode() throwing on a missing provider crashed the entire
// preview (and, once the React tree was in that broken state, everything
// else on the page including Save) the moment anyone previewed the Brand,
// Trust Stats, or Event CTA section from the admin dashboard.
const DEFAULT_VALUE: EditModeValue = {
  on: false,
  isAdmin: false,
  toggle: () => {},
  content: null,
  updateField: () => {},
};

const EditModeContext = createContext<EditModeValue>(DEFAULT_VALUE);

const STORAGE_KEY = "nl_admin_edit_mode";

function setDeep(content: EditableContent, path: string, value: string): EditableContent {
  const keys = path.split(".");
  // Shallow-clones only the branch being touched — everything else keeps
  // its original reference, which is fine since this is read-only data
  // otherwise. The top level is always the SiteContent object itself
  // (never an array), so only the loop below needs to handle array
  // branches (trustStats.<i>, services.<i>, ...).
  const clone: Record<string, unknown> = { ...content };
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    const next = cur[k];
    const nextClone = Array.isArray(next) ? [...next] : { ...(next as object) };
    cur[k] = nextClone;
    cur = nextClone as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
  return clone as unknown as EditableContent;
}

/** Admin-only "edit directly on the live page" mode — client ask
 *  (2026-08-26): a company admin's edits should go live immediately from
 *  the page itself, not just through the /admin/content dashboard (which
 *  is what editors use, approval-gated). Mounted once per page tree
 *  (marketing layout + the standalone homepage) with that page's already-
 *  fetched SiteContent as the starting point. */
export function EditModeProvider({
  initialContent,
  children,
}: {
  initialContent: EditableContent;
  children: React.ReactNode;
}) {
  const { role } = useProfileRole();
  const isAdmin = role === "admin";
  // Lazy initializer (not an effect) reading localStorage directly. Safe
  // from a hydration-mismatch standpoint even though this reads real
  // localStorage only on the client (SSR's try/catch falls back to false):
  // the value this Provider actually exposes below is `on && isAdmin`, and
  // isAdmin is false on every very-first render everywhere (useProfileRole
  // itself only resolves after its own effect) — so the exposed value is
  // consistently false on first paint regardless of this internal state.
  const [on, setOn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [content, setContent] = useState(initialContent);

  function toggle() {
    setOn((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Non-fatal — the toggle still works for this page load.
      }
      return next;
    });
  }

  function updateField(name: string, value: string) {
    setContent((c) => setDeep(c, name, value));
  }

  return (
    <EditModeContext.Provider value={{ on: on && isAdmin, isAdmin, toggle, content, updateField }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
