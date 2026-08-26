import { getRawSiteContent } from "@/lib/site-content";
import { ContentForm } from "@/components/admin/content-form";

export default async function AdminContentPage() {
  const content = await getRawSiteContent();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Edit Content</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Update the text shown on the homepage. Adding or removing entries
          (like a new team member) isn&apos;t supported here yet, ask a
          developer for that.
        </p>
      </div>
      <ContentForm content={content} />
    </div>
  );
}
