import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getApprovalsBadgeCount, getOpenReportsCount } from "@/lib/admin-counts";
import { getSiteContent } from "@/lib/site-content";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-topbar";
import { AdminScrollToTop } from "@/components/admin/admin-scroll-to-top";
import { AdminShellProvider } from "@/components/admin/admin-shell-context";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const [pendingApprovals, openReports, content, { data: profile }] = await Promise.all([
    getApprovalsBadgeCount(supabase, auth),
    getOpenReportsCount(supabase),
    getSiteContent(),
    supabase
      .from("profiles")
      .select("sidebar_order, first_name, full_name, avatar_updated_at")
      .eq("id", auth.userId)
      .maybeSingle<{
        sidebar_order: string[] | null;
        first_name: string | null;
        full_name: string | null;
        avatar_updated_at: string | null;
      }>(),
  ]);

  const displayName = profile?.full_name || profile?.first_name || null;
  const avatarUrl = profile?.avatar_updated_at
    ? `/api/site-image/avatar-${auth.userId}?v=${new Date(profile.avatar_updated_at).getTime()}`
    : null;

  return (
    <AdminShellProvider>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar
          logoUrl={content.images.logoUrl}
          logoUrlDark={content.images.logoUrlDark}
          role={auth.role}
          email={auth.email}
          displayName={displayName}
          avatarUrl={avatarUrl}
          pendingApprovals={pendingApprovals}
          openReports={openReports}
          savedOrder={profile?.sidebar_order ?? null}
        />
        <main className="min-w-0 flex-1 px-4 py-6 lg:px-6 lg:py-10">
          <AdminTopBar
            pendingApprovals={pendingApprovals}
            openReports={openReports}
            role={auth.role}
            email={auth.email}
            displayName={displayName}
            avatarUrl={avatarUrl}
          />
          {children}
        </main>
        <AdminScrollToTop />
      </div>
    </AdminShellProvider>
  );
}
