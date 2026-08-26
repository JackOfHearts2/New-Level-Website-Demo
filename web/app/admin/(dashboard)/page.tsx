import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getApprovalsBadgeCount, getOpenReportsCount } from "@/lib/admin-counts";
import { GlowCard } from "@/components/ui/glow-card";

function Tile({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <GlowCard href={href} className="block p-6">
      <h2 className="font-heading font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </GlowCard>
  );
}

export default async function AdminHomePage() {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const [pendingApprovals, openReports] = await Promise.all([
    getApprovalsBadgeCount(supabase, auth),
    getOpenReportsCount(supabase),
  ]);

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
          title={auth.role === "admin" ? `Approvals (${pendingApprovals} pending)` : "My Submissions"}
          description={
            auth.role === "admin"
              ? "Review pending content and photo changes."
              : "See the status of what you've submitted."
          }
        />
        <Tile
          href="/admin/reports"
          title={`Reports (${openReports} open)`}
          description="Problems visitors have flagged from the site."
        />
        {auth.role === "admin" && (
          <>
            <Tile
              href="/admin/editors"
              title="Access"
              description="Grant or revoke editor access."
            />
            <Tile
              href="/admin/activity"
              title="Activity"
              description="A running record of everything that&apos;s happened."
            />
            <Tile
              href="/admin/analytics"
              title="Analytics"
              description="Visitor traffic and team submission activity."
            />
          </>
        )}
        <Tile
          href="/admin/settings"
          title="Settings"
          description="Your account and notification preferences."
        />
      </div>
    </div>
  );
}
