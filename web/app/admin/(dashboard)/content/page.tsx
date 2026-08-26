import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { getRawSiteContent, getSiteContent } from "@/lib/site-content";
import { ContentForm } from "@/components/admin/content-form";

// "Content" and the old "Images" page are unified here — each section's
// fieldset holds both its text fields and its image slot(s) together, so
// there's no ambiguity about what an upload is replacing (client ask,
// 2026-08-26 — see project_admin_dashboard_redesign_2026_08_26 memory).
export default async function AdminContentPage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const [content, resolved] = await Promise.all([getRawSiteContent(), getSiteContent()]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Content &amp; Media</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update the text and photos shown on the homepage, organized the same way the live
          page is. Adding or removing entries (like a new team member) isn&apos;t supported
          here yet, ask a developer for that.
        </p>
      </div>
      <ContentForm content={content} resolved={resolved} role={auth.role} />
    </div>
  );
}
