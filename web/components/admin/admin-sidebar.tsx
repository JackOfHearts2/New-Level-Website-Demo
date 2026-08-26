"use client";

import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  FileEdit,
  Image as MediaIcon,
  ClipboardCheck,
  Flag,
  Users,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminProfileMenu } from "@/components/admin/admin-profile-menu";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  badge?: number;
};

export function AdminSidebar({
  logoUrl,
  logoUrlDark,
  role,
  email,
  pendingApprovals,
  openReports,
}: {
  logoUrl: string;
  logoUrlDark: string;
  role: "editor" | "admin";
  email: string;
  pendingApprovals: number;
  openReports: number;
}) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  const isAdmin = role === "admin";

  const mainItems: NavItem[] = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
    ...(isAdmin ? [{ href: "/admin/analytics", label: "Analytics", Icon: BarChart3 }] : []),
    { href: "/admin/content", label: "Content", Icon: FileEdit },
    { href: "/admin/images", label: "Media", Icon: MediaIcon },
    { href: "/admin/approvals", label: "Approvals", Icon: ClipboardCheck, badge: pendingApprovals },
    { href: "/admin/reports", label: "Reports", Icon: Flag, badge: openReports },
  ];
  const adminItems: NavItem[] = [
    { href: "/admin/editors", label: "Access", Icon: Users },
    { href: "/admin/activity", label: "Activity", Icon: ActivityIcon },
  ];
  const accountItems: NavItem[] = [{ href: "/admin/settings", label: "Settings", Icon: SettingsIcon }];

  return (
    <nav
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-card p-2 shadow-sm transition-all duration-300 ease-in-out",
        open ? "w-64" : "w-16"
      )}
    >
      <div className="mb-4 border-b border-border p-2 pb-4">
        {open ? (
          <>
            {/* Same dual-asset dark-mode pattern as the public SiteHeader
                (logoUrl/logoUrlDark swapped via dark:hidden/dark:block) and
                the same real size (h-16) — client feedback (2026-08-26):
                the sidebar logo used to be tiny and boxed in a white card,
                which also meant it never adapted to dark mode. No card/bg
                here on purpose — the asset itself carries the right color
                per theme, same as the public header. */}
            <div className="relative h-14 w-full">
              <NextImage
                src={logoUrl}
                alt="New Level"
                fill
                sizes="220px"
                className="object-contain object-left dark:hidden"
              />
              <NextImage
                src={logoUrlDark}
                alt="New Level"
                fill
                sizes="220px"
                className="hidden object-contain object-left dark:block"
              />
            </div>
            <div className="mt-2">
              <span className="font-heading block truncate text-sm font-semibold">New Level Admin</span>
              <span className="text-muted-foreground block text-xs capitalize">{role} access</span>
            </div>
          </>
        ) : (
          <div className="relative h-8 w-full">
            <NextImage
              src={logoUrl}
              alt="New Level"
              fill
              sizes="48px"
              className="object-contain object-left dark:hidden"
            />
            <NextImage
              src={logoUrlDark}
              alt="New Level"
              fill
              sizes="48px"
              className="hidden object-contain object-left dark:block"
            />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        <NavGroup items={mainItems} pathname={pathname} open={open} />

        {isAdmin && (
          <>
            <GroupLabel open={open}>Admin</GroupLabel>
            <NavGroup items={adminItems} pathname={pathname} open={open} />
          </>
        )}

        <GroupLabel open={open}>Account</GroupLabel>
        <NavGroup items={accountItems} pathname={pathname} open={open} />
      </div>

      <AdminProfileMenu email={email} role={role} open={open} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 flex w-full items-center gap-3 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <span className="grid size-6 shrink-0 place-content-center">
          {open ? <ChevronsLeft className="size-4" /> : <ChevronsRight className="size-4" />}
        </span>
        {open && <span className="text-sm font-medium">Collapse</span>}
      </button>
    </nav>
  );
}

function GroupLabel({ open, children }: { open: boolean; children: React.ReactNode }) {
  if (!open) return <div className="my-2 border-t border-border" />;
  return (
    <div className="text-muted-foreground px-3 pt-4 pb-1 text-xs font-medium tracking-wide uppercase">
      {children}
    </div>
  );
}

function NavGroup({
  items,
  pathname,
  open,
}: {
  items: NavItem[];
  pathname: string;
  open: boolean;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={open ? undefined : item.label}
            className={cn(
              "relative flex h-11 items-center rounded-lg transition-all duration-200 hover:translate-x-0.5",
              isActive
                ? "border-l-2 border-primary bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="grid h-full w-12 shrink-0 place-content-center">
              <item.Icon className="size-4" />
            </div>
            {open && <span className="truncate text-sm font-medium">{item.label}</span>}
            {!!item.badge && (
              <span
                className={cn(
                  "bg-destructive text-destructive-foreground flex items-center justify-center rounded-full text-xs font-semibold",
                  open ? "absolute right-3 h-5 w-5" : "absolute right-1 top-1 h-4 w-4 text-[10px]"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
