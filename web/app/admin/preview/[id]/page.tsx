import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getRawSiteContent, type SiteContent } from "@/lib/site-content";
import { resolveSiteImages } from "@/lib/site-content-images";
import { PreviewPageClient } from "./preview-client";

// Deliberately OUTSIDE the (dashboard) route group — that layout's
// max-w-4xl wrapper would squash full-width homepage sections — but still
// under proxy.ts's /admin/:path* session gate, with its own role check
// here (RLS also naturally limits an editor to previewing their own row).
type ChangeRequestRow = {
  id: string;
  target_type: "content" | "image";
  image_slot: "logo" | "hero-bg" | null;
  proposed_content: SiteContent | null;
  storage_path: string | null;
};

export default async function AdminPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("content_change_requests")
    .select("id, target_type, image_slot, proposed_content, storage_path")
    .eq("id", id)
    .single<ChangeRequestRow>();

  if (!row) redirect("/admin/approvals");

  if (row.target_type === "content") {
    if (!row.proposed_content) redirect("/admin/approvals");
    const content = {
      ...row.proposed_content,
      images: resolveSiteImages(row.proposed_content.images),
    };
    return <PreviewPageClient content={content} />;
  }

  // Image request: resolve everything else from the current live content,
  // then override just the one changed slot with the pending upload.
  if (!row.storage_path || !row.image_slot) redirect("/admin/approvals");
  const liveRaw = await getRawSiteContent();
  const { data: signed } = await supabase.storage
    .from("pending-uploads")
    .createSignedUrl(row.storage_path, 60 * 10);
  if (!signed?.signedUrl) redirect("/admin/approvals");

  const liveImages = resolveSiteImages(liveRaw.images);
  const images =
    row.image_slot === "logo"
      ? { ...liveImages, logoUrl: signed.signedUrl, logoUrlDark: signed.signedUrl }
      : { ...liveImages, heroBgUrl: signed.signedUrl };

  return <PreviewPageClient content={{ ...liveRaw, images }} />;
}
