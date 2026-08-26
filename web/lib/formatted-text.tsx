import { Fragment } from "react";

// Deliberately NOT HTML + dangerouslySetInnerHTML — this text is editable
// by editors/admins and rendered on public pages, so storing/interpreting
// arbitrary HTML would be a real stored-XSS surface. Instead this is a
// tiny, fully-controlled markup (**bold**, *italic*, __underline__) that
// only ever produces <strong>/<em>/<u> React elements — there is no path
// from stored text to raw HTML at all, so there's nothing to sanitize.
// Non-nested, single-pass — good enough for short marketing copy; doesn't
// need to handle arbitrary nesting like **bold *and italic*** correctly.
const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__)/g;

export function parseFormattedText(text: string): React.ReactNode {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("__") && part.endsWith("__")) {
      return <u key={i}>{part.slice(2, -2)}</u>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Convenience wrapper for the common case of rendering one field's worth
 *  of formatted text inline. */
export function FormattedText({ text }: { text: string }) {
  return <>{parseFormattedText(text)}</>;
}
