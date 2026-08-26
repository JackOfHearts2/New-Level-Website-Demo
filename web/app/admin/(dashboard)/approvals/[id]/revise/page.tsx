import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getSiteContent, type SiteContent } from "@/lib/site-content";
import { imageSlotLabel } from "@/lib/site-content-images";
import { ContentForm } from "@/components/admin/content-form";
import { ImageForm } from "@/components/admin/image-form";

type ChangeRequestRow = {
  id: string;
  submitted_by: string;
  target_type: "content" | "image";
  image_slot: string | null;
  proposed_content: SiteContent | null;
  storage_path: string | null;
  status: string;
};

export default async function RevisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("content_change_requests")
    .select("id, submitted_by, target_type, image_slot, proposed_content, storage_path, status")
    .eq("id", id)
    .single<ChangeRequestRow>();

  if (
    !row ||
    row.submitted_by !== auth.userId ||
    (row.status !== "pending" && row.status !== "changes_requested")
  ) {
    redirect("/admin/approvals");
  }

  const siteContent = await getSiteContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Revise submission</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Make your changes and resubmit — this updates the same request rather than
          starting a new one.
        </p>
      </div>
      {row.target_type === "content" && row.proposed_content ? (
        <ContentForm content={row.proposed_content} reviseRequestId={row.id} />
      ) : row.target_type === "image" && row.image_slot ? (
        <ImageForm
          imageKey={row.image_slot}
          label={imageSlotLabel(row.image_slot, siteContent)}
          currentUrl={null}
          siteContent={siteContent}
          reviseRequestId={row.id}
        />
      ) : (
        <p className="text-destructive text-sm">This request can&apos;t be revised.</p>
      )}
    </div>
  );
}
