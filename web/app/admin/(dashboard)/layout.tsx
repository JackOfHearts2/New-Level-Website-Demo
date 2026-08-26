import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getApprovalsBadgeCount, getOpenReportsCount } from "@/lib/admin-counts";
import { getSiteContent } from "@/lib/site-content";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-topbar";
import { AdminScrollToTop } from "@/components/admin/admin-scroll-to-top";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const [pendingApprovals, openReports, content] = await Promise.all([
    getApprovalsBadgeCount(supabase, auth),
    getOpenReportsCount(supabase),
    getSiteContent(),
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        logoUrl={content.images.logoUrl}
        logoUrlDark={content.images.logoUrlDark}
        role={auth.role}
        email={auth.email}
        pendingApprovals={pendingApprovals}
        openReports={openReports}
      />
      <main className="min-w-0 flex-1 px-6 py-10">
        <AdminTopBar pendingApprovals={pendingApprovals} openReports={openReports} />
        {children}
      </main>
      <AdminScrollToTop />
    </div>
  );
}
