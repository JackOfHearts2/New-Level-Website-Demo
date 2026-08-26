import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import {
  getApprovalsBadgeCount,
  getOpenReportsCount,
  getPendingPropertiesCount,
  getNewInquiriesCount,
} from "@/lib/admin-counts";
import { getSiteContent } from "@/lib/site-content";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopBar } from "@/components/admin/admin-topbar";
import { AdminScrollToTop } from "@/components/admin/admin-scroll-to-top";
import { AdminShellProvider } from "@/components/admin/admin-shell-context";
import { TroubleshootWidget } from "@/components/admin/troubleshoot-widget";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/");

  const supabase = await createClient();
  const [pendingApprovals, openReports, pendingProperties, newInquiries, content, { data: profile }] = await Promise.all([
    getApprovalsBadgeCount(supabase, auth),
    getOpenReportsCount(supabase),
    getPendingPropertiesCount(supabase, auth),
    getNewInquiriesCount(supabase),
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
          pendingProperties={pendingProperties}
          newInquiries={newInquiries}
          savedOrder={profile?.sidebar_order ?? null}
        />
        {/* pb-24, not the plain py-6 the rest of this padding uses — on
            mobile (below lg, where AdminSidebar collapses to a hamburger
            drawer and stops occupying the left edge, see its lg:hidden
            drawer) TroubleshootWidget's fixed bottom-4 left-4 button (now
            lg:hidden — see that component's comment) sits directly over
            whatever content is scrolled to the bottom of the viewport,
            with nothing reserving clearance for it — client report
            (2026-08-27), a screenshot showing the flag icon overlapping a
            Team "Name 2" field on Content & Media. Desktop (lg:) doesn't
            need this: the report trigger there is an in-flow row inside
            AdminSidebar's own footer, not a floating button over `main`. */}
        <main className="min-w-0 flex-1 px-4 pt-6 pb-24 lg:px-6 lg:py-10">
          <AdminTopBar
            pendingApprovals={pendingApprovals}
            openReports={openReports}
            pendingProperties={pendingProperties}
            newInquiries={newInquiries}
            role={auth.role}
            email={auth.email}
            displayName={displayName}
            avatarUrl={avatarUrl}
          />
          {children}
        </main>
        <AdminScrollToTop />
        <TroubleshootWidget />
      </div>
    </AdminShellProvider>
  );
}
