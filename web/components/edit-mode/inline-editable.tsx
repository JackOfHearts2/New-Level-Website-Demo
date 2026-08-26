"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { contentToFormData } from "@/lib/site-content-form";
import { FormattedText } from "@/lib/formatted-text";
import { saveContent } from "@/app/admin/(dashboard)/actions";
import { RichTextToolbar } from "@/components/admin/rich-text-toolbar";
import { useEditMode } from "./edit-mode-context";

const PANEL_WIDTH = 320;
const VIEWPORT_MARGIN = 16;

/** Wraps one piece of text on a live public page with a hover-visible
 *  pencil icon (admin + edit-mode-on only — otherwise renders as plain as
 *  the original text). Click → inline popover → Save writes through the
 *  same saveContent Server Action the /admin/content dashboard form uses,
 *  so it goes live immediately for an admin exactly like a dashboard save
 *  would. Builds a COMPLETE FormData via contentToFormData() with just
 *  this one field overridden — buildContentFromFormData has no partial-
 *  merge behavior, so submitting a sparse FormData would blank every
 *  other field on the site (see the big comment on contentToFormData).
 *  The popover is portaled to <body> (same reasoning as ProfileMenu) —
 *  several sections this wraps (e.g. EventCtaSection's banner) are
 *  `overflow-hidden`, which would otherwise clip an absolutely-positioned
 *  popover invisible. */
export function InlineEditable({
  name,
  value,
  textarea,
  tag: Tag = "span",
  className,
}: {
  name: string;
  value: string;
  textarea?: boolean;
  tag?: "span" | "p" | "div" | "h1" | "h2" | "h3";
  className?: string;
}) {
  const { on, isAdmin, content, updateField } = useEditMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [savedValue, setSavedValue] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverTextareaRef = useRef<HTMLTextAreaElement>(null);

  const displayValue = savedValue ?? value;

  useEffect(() => {
    if (!editing) return;
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN
    );
    setPos({ top: rect.bottom + 8, left });
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setEditing(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [editing]);

  if (!on || !isAdmin) {
    return (
      <Tag className={className}>
        <FormattedText text={displayValue} />
      </Tag>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    // Safe: this only runs once we're past the `!on || !isAdmin` early
    // return above, and `on` can only be true when a real EditModeProvider
    // set it (the context's no-provider default always has on: false,
    // content: null) — so `content` is guaranteed non-null here.
    const fd = contentToFormData(content!);
    fd.set(name, draft);
    const result = await saveContent(undefined, fd);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    updateField(name, draft);
    setSavedValue(draft);
    setEditing(false);
  }

  return (
    <Tag className={cn("group/inline-edit relative inline-block", className)}>
      <FormattedText text={displayValue} />
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setDraft(displayValue);
          setEditing((v) => !v);
          setError(null);
        }}
        aria-label={`Edit ${name}`}
        // Always visible, not hover-revealed — client ask (2026-08-26):
        // "the pencil icon needs to be persistent. It shouldn't pop-up
        // when you hover or swipe next to it." Kept a small hover scale as
        // interactive feedback without hiding the icon itself.
        className="bg-primary text-primary-foreground ml-1.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full align-middle transition-transform hover:scale-110"
      >
        <Pencil className="size-3" />
      </button>

      {editing &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{ position: "fixed", top: pos.top, left: pos.left, width: PANEL_WIDTH }}
            className="border-border bg-popover z-50 rounded-xl border p-3 text-left not-italic shadow-2xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-foreground text-xs font-semibold">Edit</span>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {textarea ? (
              <>
                <RichTextToolbar targetRef={popoverTextareaRef} />
                <textarea
                  ref={popoverTextareaRef}
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  className="border-border bg-background text-foreground w-full rounded-lg border px-2 py-1.5 text-sm"
                />
              </>
            ) : (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="border-border bg-background text-foreground w-full rounded-lg border px-2 py-1.5 text-sm"
              />
            )}
            {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-muted-foreground hover:bg-muted rounded-md px-2 py-1 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-semibold disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>,
          document.body
        )}
    </Tag>
  );
}
