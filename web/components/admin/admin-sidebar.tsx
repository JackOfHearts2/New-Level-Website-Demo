"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Image as MediaIcon,
  ClipboardCheck,
  Flag,
  Users,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  UserCog,
  X,
  Building2,
  Inbox,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminProfileMenu } from "@/components/admin/admin-profile-menu";
import { saveSidebarOrder } from "@/app/admin/(dashboard)/actions";
import { useAdminShell } from "@/components/admin/admin-shell-context";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  badge?: number;
};

// Puts any href present in `order` first (in that order), then anything
// else in its original position — so a nav item added later (or hidden
// for the current role) never disappears just because it's missing from
// an already-saved order.
function applyOrder(items: NavItem[], order: string[] | null): NavItem[] {
  if (!order || order.length === 0) return items;
  const byHref = new Map(items.map((item) => [item.href, item]));
  const ordered = order.map((href) => byHref.get(href)).filter((i): i is NavItem => !!i);
  const remaining = items.filter((item) => !order.includes(item.href));
  return [...ordered, ...remaining];
}

export function AdminSidebar({
  logoUrl,
  logoUrlDark,
  role,
  email,
  displayName,
  avatarUrl,
  pendingApprovals,
  openReports,
  pendingProperties,
  newInquiries,
  savedOrder,
}: {
  logoUrl: string;
  logoUrlDark: string;
  role: "editor" | "admin";
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  pendingApprovals: number;
  openReports: number;
  pendingProperties: number;
  newInquiries: number;
  savedOrder: string[] | null;
}) {
  const [open, setOpen] = useState(true);
  const [customizing, setCustomizing] = useState(false);
  const pathname = usePathname();
  const isAdmin = role === "admin";
  const { mobileNavOpen, setMobileNavOpen } = useAdminShell();

  // Mobile nav closes on any navigation — otherwise the drawer stays open
  // over the newly-loaded page.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  const defaultMainItems: NavItem[] = [
    { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
    ...(isAdmin ? [{ href: "/admin/analytics", label: "Analytics", Icon: BarChart3 }] : []),
    { href: "/admin/content", label: "Content & Media", Icon: MediaIcon },
    { href: "/admin/properties", label: "Properties", Icon: Building2, badge: pendingProperties },
    { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox, badge: newInquiries },
    { href: "/admin/approvals", label: "Approvals", Icon: ClipboardCheck, badge: pendingApprovals },
    { href: "/admin/reports", label: "Reports", Icon: Flag, badge: openReports },
    { href: "/admin/team", label: "Team", Icon: Network },
  ];
  // Only the ORDER lives in state, not the item objects themselves — the
  // items are rebuilt fresh every render from current props (badge counts
  // in particular), so reordering never freezes a stale approvals/reports
  // count into place.
  const [order, setOrder] = useState<string[]>(
    () => savedOrder ?? defaultMainItems.map((i) => i.href)
  );
  const mainItems = applyOrder(defaultMainItems, order);
  const adminItems: NavItem[] = [
    { href: "/admin/editors", label: "Access", Icon: Users },
    { href: "/admin/activity", label: "Activity", Icon: ActivityIcon },
  ];
  const accountItems: NavItem[] = [
    { href: "/admin/profile", label: "Profile", Icon: UserCog },
    { href: "/admin/settings", label: "Settings", Icon: SettingsIcon },
  ];

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= mainItems.length) return;
    const nextHrefs = mainItems.map((i) => i.href);
    [nextHrefs[index], nextHrefs[target]] = [nextHrefs[target], nextHrefs[index]];
    setOrder(nextHrefs);
    saveSidebarOrder(nextHrefs);
  }

  return (
    <>
      {/* Desktop: unchanged sticky, in-flow, collapsible sidebar. Hidden
          entirely below lg — the client confirmed (2026-08-26) the admin
          side "is completely jumbled on mobile... nothing is where it
          needs to be," and this was the root cause: a fixed-width flex
          item with zero responsive behavior below desktop widths. See the
          mobile drawer variant right after this element. */}
      <nav
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card p-2 shadow-sm transition-all duration-300 ease-in-out lg:flex",
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
          // Icon-only mark, not the full lockup shrunk down — client ask
          // (2026-08-26): collapsed should keep just the symbol, dropping
          // "New Level / Real Estate, Redefined" entirely. Cropped from the
          // existing full-lockup asset (public/logo.png, public/logo-dark.png)
          // via sharp, not admin-uploadable — this is fixed sidebar chrome,
          // not editable site content, so it doesn't need to go through the
          // same CMS path as logoUrl/logoUrlDark.
          <div className="relative mx-auto h-8 w-8">
            <NextImage
              src="/logo-icon.png"
              alt="New Level"
              fill
              sizes="32px"
              className="object-contain dark:hidden"
            />
            <NextImage
              src="/logo-icon-dark.png"
              alt="New Level"
              fill
              sizes="32px"
              className="hidden object-contain dark:block"
            />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {open && (
          <button
            type="button"
            onClick={() => setCustomizing((v) => !v)}
            className={cn(
              "mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              customizing
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <ArrowUpDown className="size-3.5" />
            {customizing ? "Done reordering" : "Reorder"}
          </button>
        )}
        <NavGroup items={mainItems} pathname={pathname} open={open} customizing={customizing} onMove={move} />

        {isAdmin && (
          <>
            <GroupLabel open={open}>Admin</GroupLabel>
            <NavGroup items={adminItems} pathname={pathname} open={open} />
          </>
        )}

        <GroupLabel open={open}>Account</GroupLabel>
        <NavGroup items={accountItems} pathname={pathname} open={open} />
      </div>

      <AdminProfileMenu email={email} role={role} displayName={displayName} avatarUrl={avatarUrl} open={open} />

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

      {/* Mobile: an off-canvas drawer instead of the desktop's collapse-to-
          icons pattern (a mini icon rail makes no sense as a *default*
          mobile state — there's no room to also show a topbar/hamburger
          trigger for it). Always renders the "full" (open=true) content
          regardless of the desktop collapse preference, since that's a
          separate, unrelated user choice. */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
          <nav className="border-border bg-card relative flex h-full w-72 max-w-[80vw] flex-col overflow-y-auto border-r p-3 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-4">
              <div className="relative h-10 w-40 shrink-0">
                <NextImage
                  src={logoUrl}
                  alt="New Level"
                  fill
                  sizes="160px"
                  className="object-contain object-left dark:hidden"
                />
                <NextImage
                  src={logoUrlDark}
                  alt="New Level"
                  fill
                  sizes="160px"
                  className="hidden object-contain object-left dark:block"
                />
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex size-9 shrink-0 items-center justify-center rounded-lg"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-1 overflow-y-auto">
              <NavGroup items={mainItems} pathname={pathname} open />
              {isAdmin && (
                <>
                  <GroupLabel open>Admin</GroupLabel>
                  <NavGroup items={adminItems} pathname={pathname} open />
                </>
              )}
              <GroupLabel open>Account</GroupLabel>
              <NavGroup items={accountItems} pathname={pathname} open />
            </div>

            <AdminProfileMenu email={email} role={role} displayName={displayName} avatarUrl={avatarUrl} open />
          </nav>
        </div>
      )}
    </>
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
  customizing,
  onMove,
}: {
  items: NavItem[];
  pathname: string;
  open: boolean;
  customizing?: boolean;
  onMove?: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="space-y-1">
      {items.map((item, index) => {
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        // Reorder mode swaps the Link for a static row + up/down buttons —
        // client ask (2026-08-26): "put the stuff they wanna see before
        // the other stuff they might not necessarily wanna see."
        if (customizing && onMove) {
          return (
            <div
              key={item.href}
              className="text-muted-foreground flex h-11 items-center rounded-lg pl-3 pr-1"
            >
              <item.Icon className="size-4 shrink-0" />
              {open && <span className="ml-3 flex-1 truncate text-sm font-medium">{item.label}</span>}
              <div className="ml-auto flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${item.label} up`}
                  className="hover:text-foreground disabled:opacity-30"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move ${item.label} down`}
                  className="hover:text-foreground disabled:opacity-30"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
            </div>
          );
        }

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
