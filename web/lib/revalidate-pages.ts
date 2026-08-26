import "server-only";
import { revalidatePath } from "next/cache";
import { PAGE_CONTENT_PATHS } from "@/lib/page-content-keys";

/** Every place that writes SiteContent (saveContent/saveContentSection in
 *  app/admin/(dashboard)/actions.ts, the approval-publish paths in
 *  approvals/actions.ts) needs to call this alongside revalidatePath("/")
 *  — most of the 12 pages wired into SiteContent.pages (2026-08-27) render
 *  statically (no per-request dynamic data of their own), so Next only
 *  re-renders them on the next request after an explicit revalidatePath()
 *  for that exact route. Missing one here means that page keeps serving
 *  whatever was baked in at the last build/previous revalidation — a real,
 *  easy-to-miss staleness bug, not just a cosmetic one, so this is the
 *  single place the path list lives rather than copy-pasted at each call
 *  site. */
export function revalidateSiteContentPages() {
  for (const path of Object.values(PAGE_CONTENT_PATHS)) {
    revalidatePath(path);
  }
}
