import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

function Tile({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="border-border block rounded-2xl border p-6 shadow-sm transition-colors hover:bg-muted"
    >
      <h2 className="font-heading font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </Link>
  );
}

export default async function AdminHomePage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const pendingFilter = auth.role === "admin" ? {} : { submitted_by: auth.userId };
  const { count: pendingApprovals } = await supabase
    .from("content_change_requests")
    .select("id", { count: "exact", head: true })
    .match({ status: "pending", ...pendingFilter });
  const { count: openReports } = await supabase
    .from("problem_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "open");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {auth.role === "admin"
            ? "Edit what visitors see, or review changes submitted by editors."
            : "Propose content and photo changes — an admin reviews them before they go live."}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Tile
          href="/admin/content"
          title="Edit Content"
          description="About text, services, team bios, testimonials, and more."
        />
        <Tile
          href="/admin/images"
          title="Edit Images"
          description="Swap the logo and the homepage background photo."
        />
        <Tile
          href="/admin/approvals"
          title={auth.role === "admin" ? `Approvals (${pendingApprovals ?? 0} pending)` : "My Submissions"}
          description={
            auth.role === "admin"
              ? "Review pending content and photo changes."
              : "See the status of what you've submitted."
          }
        />
        <Tile
          href="/admin/reports"
          title={`Reports (${openReports ?? 0} open)`}
          description="Problems visitors have flagged from the site."
        />
        {auth.role === "admin" && (
          <Tile
            href="/admin/editors"
            title="Editors"
            description="Grant or revoke editor access."
          />
        )}
      </div>
    </div>
  );
}
