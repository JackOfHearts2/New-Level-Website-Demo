"use client";

import { Bold, Italic, Underline } from "lucide-react";

const MARKERS = { bold: "**", italic: "*", underline: "__" } as const;

/** Wraps the textarea's current selection with the marker pair (or, if
 *  nothing's selected, inserts an empty pair with the cursor placed
 *  between them) — the classic markdown-toolbar pattern (GitHub's comment
 *  box, etc.), which works reliably on a plain <textarea> without needing
 *  a contentEditable rich-text editor. Fires a real 'input' event
 *  afterward so React's onInput/onChange handlers (and this project's
 *  auto-resize) see the change — setting .value directly doesn't trigger
 *  those on its own. */
function wrapSelection(el: HTMLTextAreaElement, marker: string) {
  const { selectionStart, selectionEnd, value } = el;
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);
  const next = `${before}${marker}${selected}${marker}${after}`;

  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
  setter?.call(el, next);
  el.dispatchEvent(new Event("input", { bubbles: true }));

  const cursor = selected
    ? selectionStart + marker.length * 2 + selected.length
    : selectionStart + marker.length;
  el.focus();
  el.setSelectionRange(cursor, cursor);
}

export function RichTextToolbar({ targetRef }: { targetRef: React.RefObject<HTMLTextAreaElement | null> }) {
  function apply(marker: string) {
    const el = targetRef.current;
    if (!el) return;
    wrapSelection(el, marker);
  }

  return (
    <div className="mb-1 flex gap-1">
      <button
        type="button"
        onClick={() => apply(MARKERS.bold)}
        aria-label="Bold"
        title="Bold"
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-md"
      >
        <Bold className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => apply(MARKERS.italic)}
        aria-label="Italic"
        title="Italic"
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-md"
      >
        <Italic className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => apply(MARKERS.underline)}
        aria-label="Underline"
        title="Underline"
        className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-7 items-center justify-center rounded-md"
      >
        <Underline className="size-3.5" />
      </button>
    </div>
  );
}
