import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { requireAdminRole } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

function NavLink({ href, children, badge }: { href: string; children: React.ReactNode; badge?: number }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium"
    >
      {children}
      {!!badge && (
        <span className="bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 text-xs font-semibold">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdminRole();
  if (!auth) redirect("/admin/login");

  const supabase = await createClient();
  const pendingFilter =
    auth.role === "admin" ? {} : { submitted_by: auth.userId };
  const { count: pendingApprovals } = await supabase
    .from("content_change_requests")
    .select("id", { count: "exact", head: true })
    .match({ status: "pending", ...pendingFilter });
  const { count: openReports } =
    auth.role === "admin" || auth.role === "editor"
      ? await supabase
          .from("problem_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "open")
      : { count: 0 };

  return (
    <div className="min-h-screen">
      <header className="border-border border-b">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <nav className="flex flex-wrap items-center gap-5">
            <Link href="/admin" className="font-heading font-bold">
              New Level Admin
            </Link>
            <NavLink href="/admin/content">Content</NavLink>
            <NavLink href="/admin/images">Images</NavLink>
            <NavLink href="/admin/approvals" badge={pendingApprovals ?? 0}>
              Approvals
            </NavLink>
            <NavLink href="/admin/reports" badge={openReports ?? 0}>
              Reports
            </NavLink>
            {auth.role === "admin" && (
              <NavLink href="/admin/editors">Editors</NavLink>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
            >
              View live site ↗
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
