import "server-only";
import type { SiteContent } from "@/lib/site-content";

const SECTION_LABELS: Record<string, string> = {
  brand: "Brand",
  eventCta: "Event CTA",
  trustStats: "Trust Stats",
  services: "Services",
  testimonials: "Testimonials",
  team: "Team",
  socials: "Social links",
  pages: "Page headers",
};

// Only these top-level keys are ever field-editable from ContentForm —
// `schemaVersion`/`images` are excluded on purpose (image slots are their
// own separate request rows with their own image_slot-specific summary,
// see saveImage/approveRequest in actions.ts).
const DIFFABLE_KEYS = Object.keys(SECTION_LABELS) as (keyof SiteContent)[];

export type ContentChange = { section: string; kind: "added" | "removed" | "updated" };

// Generic before/after string-leaf walk over SiteContent's nested
// object/array shape — doesn't need to know the exact schema of each
// section (trustStats/services/testimonials/team are all arrays of
// similarly-shaped records), just that leaves are strings.
function walk(before: unknown, after: unknown, section: string, out: ContentChange[]) {
  if (typeof before === "string" || typeof after === "string") {
    const b = typeof before === "string" ? before.trim() : "";
    const a = typeof after === "string" ? after.trim() : "";
    if (a === b) return;
    out.push({ section, kind: !b && a ? "added" : b && !a ? "removed" : "updated" });
    return;
  }
  if (Array.isArray(before) || Array.isArray(after)) {
    const bArr = Array.isArray(before) ? before : [];
    const aArr = Array.isArray(after) ? after : [];
    const len = Math.max(bArr.length, aArr.length);
    for (let i = 0; i < len; i++) walk(bArr[i], aArr[i], section, out);
    return;
  }
  if ((before && typeof before === "object") || (after && typeof after === "object")) {
    const bObj = (before ?? {}) as Record<string, unknown>;
    const aObj = (after ?? {}) as Record<string, unknown>;
    for (const key of new Set([...Object.keys(bObj), ...Object.keys(aObj)])) {
      walk(bObj[key], aObj[key], section, out);
    }
  }
}

/** Pinpoints exactly which sections changed between two SiteContent
 *  snapshots, and whether each changed field was added, removed (cleared
 *  to empty), or just edited — client ask (2026-08-27): "I want the
 *  website itself to... pinpoint the particular area where it was
 *  changed, and pinpoint if something was updated or if something got
 *  removed." Used by both the direct-save path (persistContent/
 *  persistDraft, which already have both snapshots on hand) and the
 *  approvals path (diffing a request's base_content vs proposed_content). */
export function diffSiteContent(before: SiteContent, after: SiteContent): ContentChange[] {
  const changes: ContentChange[] = [];
  for (const key of DIFFABLE_KEYS) {
    walk(before[key], after[key], SECTION_LABELS[key], changes);
  }
  return changes;
}

/** Turns a change list into "Brand (1 updated); Team (1 added, 1 removed)"
 *  — appended to an activity-log summary so it names the actual section(s)
 *  touched instead of a generic "a content change". */
export function describeContentChanges(changes: ContentChange[]): string | null {
  if (changes.length === 0) return null;
  const bySection = new Map<string, { added: number; removed: number; updated: number }>();
  for (const c of changes) {
    const bucket = bySection.get(c.section) ?? { added: 0, removed: 0, updated: 0 };
    bucket[c.kind]++;
    bySection.set(c.section, bucket);
  }
  return Array.from(bySection.entries())
    .map(([section, b]) => {
      const bits = [
        b.updated && `${b.updated} updated`,
        b.added && `${b.added} added`,
        b.removed && `${b.removed} removed`,
      ].filter(Boolean);
      return `${section} (${bits.join(", ")})`;
    })
    .join("; ");
}
